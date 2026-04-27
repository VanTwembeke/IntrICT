// ── /api/contracts ────────────────────────────────────────────────────────────
// GET  — list all contracts (admin only)
// POST — create contract: resolves/creates client dossier, generates contract
//        text, sets up a recurring invoice template for the cron job.

import { NextResponse } from 'next/server';
import { createClient }      from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COMPANY }           from '@/lib/company';
import { generateContractText } from '@/lib/contract-text';
import type { ContractServiceType } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateContractNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CTR-${year}-${rand}`;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${rand}`;
}

/** Returns the first day of the month after the given ISO date string. */
function firstOfNextMonth(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'active' | 'cancelled' | null (= all)

  const query = supabase
    .from('contracts')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city)
    `)
    .order('created_at', { ascending: false });

  if (status) query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const {
    // Existing client
    profile_id,
    dossier_id,
    // Guest client fields
    guest_name,
    guest_email,
    guest_company,
    guest_vat_number,
    guest_address,
    guest_postal_code,
    guest_city,
    // Contract fields
    service_type,
    service_description,
    monthly_price_excl_vat,
    vat_rate = 21,
    start_date,
    notice_period_months = 3,
    notes,
  } = body as {
    profile_id?: string;
    dossier_id?: string;
    guest_name?: string;
    guest_email?: string;
    guest_company?: string;
    guest_vat_number?: string;
    guest_address?: string;
    guest_postal_code?: string;
    guest_city?: string;
    service_type: ContractServiceType;
    service_description: string;
    monthly_price_excl_vat: number;
    vat_rate?: number;
    start_date: string;
    notice_period_months?: number;
    notes?: string;
  };

  // ── Validation ────────────────────────────────────────────────────────────
  if (!service_type || !['website', 'hosting', 'domain', 'other'].includes(service_type)) {
    return NextResponse.json({ error: 'Ongeldig service type.' }, { status: 400 });
  }
  if (!service_description?.trim()) {
    return NextResponse.json({ error: 'Omschrijving is verplicht.' }, { status: 400 });
  }
  if (!monthly_price_excl_vat || monthly_price_excl_vat < 0) {
    return NextResponse.json({ error: 'Maandelijkse prijs is verplicht.' }, { status: 400 });
  }
  if (!start_date) {
    return NextResponse.json({ error: 'Startdatum is verplicht.' }, { status: 400 });
  }

  const isGuestContract = !profile_id;
  if (isGuestContract && !guest_email && !guest_name) {
    return NextResponse.json({ error: 'Klantgegevens zijn verplicht (naam of e-mail).' }, { status: 400 });
  }

  // ── Step 1: Resolve / create client dossier ───────────────────────────────
  // Reuses the exact same deduplication logic as /api/invoices
  let resolvedDossierId: string | null = dossier_id ?? null;
  let resolvedProfileId: string | null = profile_id ?? null;

  if (isGuestContract && !resolvedDossierId) {
    const admin = createAdminClient();

    // 1a. Match existing guest dossier by email
    if (guest_email) {
      const { data: existingGuest } = await admin
        .from('client_dossiers')
        .select('id, profile_id')
        .ilike('guest_email', guest_email.trim())
        .maybeSingle();

      if (existingGuest) {
        resolvedDossierId = existingGuest.id;
        resolvedProfileId = existingGuest.profile_id ?? null;
      }
    }

    // 1b. Match a profile-linked dossier by email
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

    // 1c. Match by VAT number
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

    // 1d. No match — create new guest dossier
    if (!resolvedDossierId) {
      const admin = createAdminClient();
      const { data: newDossier, error: dossierErr } = await admin
        .from('client_dossiers')
        .insert({
          profile_id: null,
          status: 'klant',
          source: 'manual',
          guest_name:    guest_name?.trim()    ?? null,
          guest_email:   guest_email?.trim()   ?? null,
          guest_company: guest_company?.trim() ?? null,
        })
        .select('id')
        .single();

      if (dossierErr) {
        return NextResponse.json({ error: `Klantdossier aanmaken mislukt: ${dossierErr.message}` }, { status: 500 });
      }
      resolvedDossierId = newDossier.id;
    }
  }

  // ── Step 2: Resolve client display data for contract text ─────────────────
  let clientName    = guest_name    ?? '';
  let clientCompany = guest_company ?? null;
  let clientVat     = guest_vat_number ?? null;
  let clientAddress = guest_address ?? null;
  let clientPostal  = guest_postal_code ?? null;
  let clientCity    = guest_city ?? null;
  let clientEmail   = guest_email ?? null;

  if (resolvedProfileId) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, email, company, vat_number, address, postal_code, city')
      .eq('id', resolvedProfileId)
      .maybeSingle();

    if (prof) {
      clientName    = prof.full_name ?? '';
      clientCompany = prof.company   ?? null;
      clientVat     = prof.vat_number ?? null;
      clientAddress = prof.address   ?? null;
      clientPostal  = prof.postal_code ?? null;
      clientCity    = prof.city      ?? null;
      clientEmail   = prof.email;
    }
  }

  // ── Step 3: Generate unique contract number ────────────────────────────────
  let contract_number = generateContractNumber();
  for (let i = 0; i < 5; i++) {
    const { data: dup } = await supabase
      .from('contracts').select('id').eq('contract_number', contract_number).maybeSingle();
    if (!dup) break;
    contract_number = generateContractNumber();
  }

  // ── Step 4: Calculate billing dates ───────────────────────────────────────
  const first_invoice_date = firstOfNextMonth(start_date);

  // ── Step 5: Generate contract text ────────────────────────────────────────
  const contract_text = generateContractText({
    contractNumber:      contract_number,
    serviceType:         service_type,
    serviceDescription:  service_description,
    monthlyPriceExclVat: monthly_price_excl_vat,
    vatRate:             vat_rate,
    startDate:           start_date,
    firstInvoiceDate:    first_invoice_date,
    noticePeriodMonths:  notice_period_months,
    notes:               notes ?? null,
    parties: {
      clientName,
      clientCompany,
      clientVat,
      clientAddress,
      clientPostal,
      clientCity,
      clientEmail,
    },
  });

  // ── Step 6: Insert contract ────────────────────────────────────────────────
  const { data: contract, error: contractErr } = await supabase
    .from('contracts')
    .insert({
      contract_number,
      dossier_id:             resolvedDossierId,
      profile_id:             resolvedProfileId,
      guest_name:             guest_name?.trim()        ?? null,
      guest_email:            guest_email?.trim()       ?? null,
      guest_company:          guest_company?.trim()     ?? null,
      guest_vat_number:       guest_vat_number?.trim()  ?? null,
      guest_address:          guest_address?.trim()     ?? null,
      guest_postal_code:      guest_postal_code?.trim() ?? null,
      guest_city:             guest_city?.trim()        ?? null,
      service_type,
      service_description:    service_description.trim(),
      monthly_price_excl_vat,
      vat_rate,
      start_date,
      first_invoice_date,
      notice_period_months,
      status:                 'active',
      contract_text,
      notes:                  notes?.trim() ?? null,
    })
    .select()
    .single();

  if (contractErr) {
    return NextResponse.json({ error: contractErr.message }, { status: 500 });
  }

  // ── Step 7: Create recurring invoice template ─────────────────────────────
  // The template itself is a "draft" — the cron job generates the actual
  // monthly invoices from it starting on first_invoice_date.
  const subtotal   = monthly_price_excl_vat;
  const vat_amount = Math.round(subtotal * vat_rate) / 100;
  const total      = subtotal + vat_amount;
  const due_date   = addMonths(first_invoice_date, 0); // same month, payment_days handled separately

  // Generate unique invoice number for the template
  let invoice_number = generateInvoiceNumber();
  for (let i = 0; i < 5; i++) {
    const { data: dup } = await supabase
      .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
    if (!dup) break;
    invoice_number = generateInvoiceNumber();
  }

  const SERVICE_INVOICE_DESCRIPTIONS: Record<ContractServiceType, string> = {
    website: 'Maandelijks websitebeheer',
    hosting: 'Maandelijkse hostingdiensten',
    domain:  'Maandelijks domeinnaambeheer',
    other:   'Maandelijkse dienstverlening',
  };
  const invoiceDescription = `${SERVICE_INVOICE_DESCRIPTIONS[service_type]} — ${service_description}`;

  const { data: invoice, error: invoiceErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number,
      profile_id:            resolvedProfileId,
      dossier_id:            resolvedDossierId,
      status:                'draft',    // template — not sent directly
      issue_date:            first_invoice_date,
      due_date:              addMonths(first_invoice_date, 0),
      subtotal,
      vat_rate,
      vat_amount,
      total,
      notes:                 `Contract ${contract_number} — ${SERVICE_LABELS_SHORT[service_type]}`,
      language:              'nl',
      is_recurring:          true,
      recurring_interval:    'monthly',
      recurring_start_date:  first_invoice_date,
      // recurring_next_date = first_invoice_date: cron generates first copy on that date
      recurring_next_date:   first_invoice_date,
      // Guest data
      guest_name:            guest_name?.trim()        ?? null,
      guest_email:           guest_email?.trim()       ?? null,
      guest_company:         guest_company?.trim()     ?? null,
      guest_vat_number:      guest_vat_number?.trim()  ?? null,
      guest_address:         guest_address?.trim()     ?? null,
      guest_postal_code:     guest_postal_code?.trim() ?? null,
      guest_city:            guest_city?.trim()        ?? null,
    })
    .select('id')
    .single();

  if (invoiceErr) {
    // Contract was created — log the issue but don't fail the whole request
    console.error('Contract aangemaakt maar recurring invoice template mislukt:', invoiceErr.message);
  } else {
    // Insert the recurring line item
    await supabase.from('invoice_items').insert({
      invoice_id:  invoice!.id,
      description: invoiceDescription,
      quantity:    1,
      unit_price:  subtotal,
      total:       subtotal,
      package_id:  null,
    });

    // Link invoice template back to contract
    await supabase
      .from('contracts')
      .update({ recurring_invoice_id: invoice!.id })
      .eq('id', contract.id);
  }

  // ── Step 8: Activity log ──────────────────────────────────────────────────
  await supabase.from('activity_logs').insert({
    profile_id: resolvedProfileId,
    dossier_id: resolvedDossierId,
    type:       'status_change',
    title:      `Contract ${contract_number} aangemaakt — ${SERVICE_LABELS_SHORT[service_type]} \u2014 \u20ac${monthly_price_excl_vat.toFixed(2)}/mnd`,
    metadata: {
      contract_id:     contract.id,
      contract_number,
      service_type,
      monthly_price:   monthly_price_excl_vat,
      first_invoice:   first_invoice_date,
    },
  });

  return NextResponse.json(contract, { status: 201 });
}

// ── Internal label map ────────────────────────────────────────────────────────
const SERVICE_LABELS_SHORT: Record<ContractServiceType, string> = {
  website: 'Website Overname',
  hosting: 'Hosting',
  domain:  'Domeinnaam',
  other:   'Dienstverlening',
};
