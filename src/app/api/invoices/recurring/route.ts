// ── /api/invoices/recurring ───────────────────────────────────────────────────
// Called daily by Vercel Cron (see vercel.json).
// Finds all recurring invoices whose next_date has been reached, generates a
// new invoice copy, and advances the schedule.
//
// Secured via CRON_SECRET environment variable.
// Add CRON_SECRET=<random-string> to Vercel environment variables.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COMPANY } from '@/lib/company';

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${rand}`;
}

function nextRecurringDate(base: string, interval: 'monthly' | 'quarterly' | 'yearly'): string {
  const d = new Date(base);
  if (interval === 'monthly')   d.setMonth(d.getMonth() + 1);
  if (interval === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (interval === 'yearly')    d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  // Verify the Vercel cron secret
  const auth = request.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // Fetch all recurring invoices that are due (or overdue)
  const { data: dueInvoices, error: fetchErr } = await admin
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('is_recurring', true)
    .lte('recurring_next_date', today)
    .not('recurring_next_date', 'is', null)
    .not('status', 'in', '("cancelled")');

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!dueInvoices?.length) {
    return NextResponse.json({ processed: 0, message: 'Geen terugkerende facturen gevonden.' });
  }

  const results: Array<{ source_id: string; new_invoice_number: string; error?: string }> = [];

  for (const inv of dueInvoices) {
    try {
      // Generate a unique invoice number for the new copy
      let newNumber = generateInvoiceNumber();
      for (let i = 0; i < 5; i++) {
        const { data: dup } = await admin
          .from('invoices').select('id').eq('invoice_number', newNumber).maybeSingle();
        if (!dup) break;
        newNumber = generateInvoiceNumber();
      }

      // The new invoice's issue date = the scheduled recurring date
      const newIssueDate = inv.recurring_next_date as string;
      const newDueDate   = addDays(newIssueDate, COMPANY.payment_days);

      // Create the new invoice (a standalone copy — not itself recurring)
      const { data: newInvoice, error: insertErr } = await admin
        .from('invoices')
        .insert({
          invoice_number:    newNumber,
          profile_id:        inv.profile_id,
          dossier_id:        inv.dossier_id,
          status:            'sent',      // Auto-send recurring invoices
          issue_date:        newIssueDate,
          due_date:          newDueDate,
          subtotal:          inv.subtotal,
          vat_rate:          inv.vat_rate,
          vat_amount:        inv.vat_amount,
          total:             inv.total,
          notes:             inv.notes,
          language:          inv.language,
          is_recurring:      false,        // Copy is a one-time invoice
          recurring_interval: null,
          // Copy guest data
          guest_name:        inv.guest_name,
          guest_email:       inv.guest_email,
          guest_company:     inv.guest_company,
          guest_vat_number:  inv.guest_vat_number,
          guest_address:     inv.guest_address,
          guest_postal_code: inv.guest_postal_code,
          guest_city:        inv.guest_city,
        })
        .select('id')
        .single();

      if (insertErr || !newInvoice) {
        results.push({ source_id: inv.id, new_invoice_number: newNumber, error: insertErr?.message });
        continue;
      }

      // Clone line items to the new invoice
      const itemRows = (inv.items ?? []).map((item: {
        description: string;
        quantity: number;
        unit_price: number;
        total: number;
        package_id: string | null;
      }) => ({
        invoice_id:  newInvoice.id,
        description: item.description,
        quantity:    item.quantity,
        unit_price:  item.unit_price,
        total:       item.total,
        package_id:  item.package_id,
      }));

      if (itemRows.length) {
        await admin.from('invoice_items').insert(itemRows);
      }

      // Advance the schedule on the parent invoice
      const updatedNextDate = nextRecurringDate(newIssueDate, inv.recurring_interval);
      await admin
        .from('invoices')
        .update({ recurring_next_date: updatedNextDate })
        .eq('id', inv.id);

      // Log activity
      await admin.from('activity_logs').insert({
        profile_id: inv.profile_id,
        dossier_id: inv.dossier_id,
        type: 'invoice_created',
        title: `Terugkerende factuur ${newNumber} automatisch aangemaakt — \u20ac${inv.total.toFixed(2)}`,
        metadata: {
          invoice_id:        newInvoice.id,
          invoice_number:    newNumber,
          source_invoice_id: inv.id,
          total:             inv.total,
          auto_generated:    true,
        },
      });

      results.push({ source_id: inv.id, new_invoice_number: newNumber });
    } catch (err) {
      results.push({
        source_id: inv.id,
        new_invoice_number: '',
        error: err instanceof Error ? err.message : 'Onbekende fout',
      });
    }
  }

  return NextResponse.json({
    processed: results.filter((r) => !r.error).length,
    failed:    results.filter((r) => r.error).length,
    results,
  });
}
