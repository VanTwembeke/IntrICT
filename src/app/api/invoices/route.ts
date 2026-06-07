export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMail } from '@/lib/mailer';
import { InvoicePDF } from '@/lib/invoice-pdf';
import type { Invoice } from '@/lib/types';

function generateInvoiceNumber(type: 'invoice' | 'credit_note' = 'invoice'): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return type === 'credit_note' ? `CN-${year}-${rand}` : `INV-${year}-${rand}`;
}

function nextRecurringDate(base: string, interval: 'monthly' | 'quarterly' | 'yearly'): string {
  const d = new Date(base);
  if (interval === 'monthly')   d.setMonth(d.getMonth() + 1);
  if (interval === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (interval === 'yearly')    d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const query = supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city),
      items:invoice_items(*)
    `)
    .order('created_at', { ascending: false });

  if (status) query.eq('status', status);
  if (!isAdmin) query.eq('profile_id', user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const {
    profile_id,
    dossier_id,
    guest_name,
    guest_email,
    guest_company,
    guest_vat_number,
    guest_address,
    guest_postal_code,
    guest_city,
    guest_phone,
    due_date,
    notes,
    vat_rate = 21,
    is_recurring = false,
    recurring_interval = null,
    language = 'nl',
    items = [],
    status = 'draft',
    issue_date,
    send_email = false,
    type = 'invoice',
    linked_invoice_id = null,
  } = body;

  const isGuestInvoice = !profile_id;
  if (isGuestInvoice && !dossier_id && !guest_email && !guest_name) {
    return NextResponse.json({ error: 'Klantgegevens zijn verplicht (naam of e-mail).' }, { status: 400 });
  }
  if (!items.length) return NextResponse.json({ error: 'Minstens één factuurlijn is verplicht.' }, { status: 400 });

  // ── Deduplication & dossier resolution ───────────────────────────────────
  let resolvedDossierId: string | null = dossier_id ?? null;
  let resolvedProfileId: string | null = profile_id ?? null;

  if (isGuestInvoice && !resolvedDossierId) {
    const admin = createAdminClient();

    if (guest_email) {
      const { data: existingGuestDossier } = await admin
        .from('client_dossiers')
        .select('id, profile_id')
        .ilike('guest_email', guest_email.trim())
        .maybeSingle();

      if (existingGuestDossier) {
        resolvedDossierId = existingGuestDossier.id;
        resolvedProfileId = existingGuestDossier.profile_id ?? null;
      }
    }

    if (!resolvedDossierId && guest_email) {
      const { data: matchedProfile } = await admin
        .from('profiles')
        .select('id')
        .ilike('email', guest_email.trim())
        .maybeSingle();

      if (matchedProfile) {
        const { data: profileDossier } = await admin
          .from('client_dossiers')
          .select('id')
          .eq('profile_id', matchedProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (profileDossier) {
          resolvedDossierId = profileDossier.id;
          resolvedProfileId = matchedProfile.id;
        }
      }
    }

    if (!resolvedDossierId && guest_vat_number) {
      const { data: vatProfile } = await admin
        .from('profiles')
        .select('id')
        .ilike('vat_number', guest_vat_number.trim())
        .maybeSingle();

      if (vatProfile) {
        const { data: vatDossier } = await admin
          .from('client_dossiers')
          .select('id')
          .eq('profile_id', vatProfile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (vatDossier) {
          resolvedDossierId = vatDossier.id;
          resolvedProfileId = vatProfile.id;
        }
      }
    }

    if (!resolvedDossierId) {
      const { data: newDossier, error: dossierErr } = await admin
        .from('client_dossiers')
        .insert({
          profile_id:        null,
          status:            'klant',
          source:            'manual',
          guest_name:        guest_name?.trim()        ?? null,
          guest_email:       guest_email?.trim()       ?? null,
          guest_company:     guest_company?.trim()     ?? null,
          guest_vat_number:  guest_vat_number?.trim()  ?? null,
          guest_address:     guest_address?.trim()     ?? null,
          guest_postal_code: guest_postal_code?.trim() ?? null,
          guest_city:        guest_city?.trim()        ?? null,
          guest_phone:       guest_phone?.trim()       ?? null,
        })
        .select('id')
        .single();

      if (dossierErr) {
        return NextResponse.json({ error: `Kon klantdossier niet aanmaken: ${dossierErr.message}` }, { status: 500 });
      }

      resolvedDossierId = newDossier.id;
    }
  }

  // ── Compute totals ────────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (s: number, i: { quantity: number; unit_price: number }) => s + i.quantity * i.unit_price,
    0,
  );
  const vat_amount = Math.round(subtotal * vat_rate) / 100;
  const total = subtotal + vat_amount;

  const effectiveIssueDate = issue_date ?? new Date().toISOString().slice(0, 10);

  const recurring_start_date = is_recurring ? effectiveIssueDate : null;
  const recurring_next_date  = (is_recurring && recurring_interval)
    ? nextRecurringDate(effectiveIssueDate, recurring_interval)
    : null;

  // ── Generate unique invoice number ────────────────────────────────────────
  let invoice_number = generateInvoiceNumber(type);
  for (let attempts = 0; attempts < 5; attempts++) {
    const { data: existing } = await supabase
      .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
    if (!existing) break;
    invoice_number = generateInvoiceNumber(type);
  }

  // ── Insert invoice ────────────────────────────────────────────────────────
  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number,
      type,
      linked_invoice_id: linked_invoice_id ?? null,
      profile_id:   resolvedProfileId,
      dossier_id:   resolvedDossierId,
      status,
      issue_date:   effectiveIssueDate,
      due_date:     due_date ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      subtotal,
      vat_rate,
      vat_amount,
      total,
      notes:        notes ?? null,
      language,
      is_recurring,
      recurring_interval,
      recurring_start_date,
      recurring_next_date,
      guest_name:        guest_name?.trim()        ?? null,
      guest_email:       guest_email?.trim()       ?? null,
      guest_company:     guest_company?.trim()     ?? null,
      guest_vat_number:  guest_vat_number?.trim()  ?? null,
      guest_address:     guest_address?.trim()     ?? null,
      guest_postal_code: guest_postal_code?.trim() ?? null,
      guest_city:        guest_city?.trim()        ?? null,
    })
    .select()
    .single();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // ── Insert line items ─────────────────────────────────────────────────────
  const itemRows = items.map((i: {
    description: string;
    notes?: string;
    quantity: number;
    unit_price: number;
    package_id?: string;
  }) => ({
    invoice_id:  invoice.id,
    description: i.description,
    notes:       i.notes?.trim() || null,
    quantity:    i.quantity,
    unit_price:  i.unit_price,
    total:       Math.round(i.quantity * i.unit_price * 100) / 100,
    package_id:  i.package_id ?? null,
  }));

  const { error: itemErr } = await supabase.from('invoice_items').insert(itemRows);
  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });

  // ── Activity log ──────────────────────────────────────────────────────────
  await supabase.from('activity_logs').insert({
    profile_id: resolvedProfileId,
    dossier_id: resolvedDossierId,
    type: 'invoice_created',
    title: `Factuur ${invoice_number} aangemaakt — €${total.toFixed(2)}`,
    metadata: {
      invoice_id: invoice.id,
      invoice_number,
      total,
      is_guest: isGuestInvoice,
      sent_by_email: send_email,
    },
  });

  // ── Send invoice by e-mail if requested ───────────────────────────────────
  if (send_email) {
    const clientEmail = resolvedProfileId
      ? (await supabase.from('profiles').select('email').eq('id', resolvedProfileId).single()).data?.email
      : guest_email?.trim();

    if (clientEmail) {
      try {
        const { data: fullInvoice } = await supabase
          .from('invoices')
          .select(`*, profile:profiles(full_name, email, company, vat_number, address, postal_code, city, phone), items:invoice_items(*)`)
          .eq('id', invoice.id)
          .single();

        if (fullInvoice) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfBuffer = await renderToBuffer(React.createElement(InvoicePDF, { invoice: fullInvoice as Invoice }) as any);
          const clientName = fullInvoice.profile?.full_name ?? fullInvoice.guest_name ?? clientEmail;
          const dueDateStr = fullInvoice.due_date
            ? new Date(fullInvoice.due_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
            : null;

          await sendMail({
            to: clientEmail,
            subject: type === 'credit_note' ? `Creditnota ${invoice_number} van IntrICT` : `Factuur ${invoice_number} van IntrICT`,
            replyTo: 'info@intrict.com',
            html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
  <div style="background:#1d4ed8;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px">IntrICT</h1>
    <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px">IT-diensten &amp; weboplossingen</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 16px;font-size:15px">Beste ${clientName},</p>
    <p style="margin:0 0 16px;color:#475569">In bijlage vindt u ${type === 'credit_note' ? 'creditnota' : 'factuur'} <strong>${invoice_number}</strong> ten bedrage van <strong>&euro; ${Math.abs(total).toFixed(2).replace('.', ',')}</strong>.</p>
    ${dueDateStr ? `<p style="margin:0 0 24px;color:#475569">Gelieve te betalen v&oacute;or <strong>${dueDateStr}</strong>.</p>` : ''}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="margin:0;font-size:12px;color:#94a3b8">Met vriendelijke groeten,<br><strong style="color:#1d4ed8">IntrICT</strong> &middot; info@intrict.com</p>
  </div>
</div>`,
            attachments: [{ name: `factuur-${invoice_number}.pdf`, content: Buffer.from(pdfBuffer) }],
          });
        }
      } catch {
        // E-mail mislukking is niet fataal — factuur is al aangemaakt
      }
    }
  }

  return NextResponse.json(invoice, { status: 201 });
}
