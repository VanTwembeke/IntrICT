// ── /api/contracts/[id] ───────────────────────────────────────────────────────
// GET   — single contract detail
// PATCH — update contract (cancel, update notes, etc.)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city)
    `)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const allowed = [
    'status',
    'cancellation_date',
    'cancellation_reason',
    'notes',
    'notice_period_months',
    'monthly_price_excl_vat',
    'vat_rate',
    'service_description',
  ] as const;

  // Only pass through allowed fields to prevent over-posting
  const updates: Partial<Record<typeof allowed[number], unknown>> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Geen geldige velden om te updaten.' }, { status: 400 });
  }

  // If cancelling, require cancellation_date
  if (updates.status === 'cancelled' && !updates.cancellation_date) {
    updates.cancellation_date = new Date().toISOString().slice(0, 10);
  }

  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If cancelling: also stop the recurring invoice template so the cron won't
  // generate new invoices after the cancellation date.
  if (updates.status === 'cancelled' && data.recurring_invoice_id) {
    await supabase
      .from('invoices')
      .update({ status: 'cancelled', is_recurring: false })
      .eq('id', data.recurring_invoice_id);
  }

  // Activity log
  if (updates.status === 'cancelled') {
    await supabase.from('activity_logs').insert({
      profile_id: data.profile_id,
      dossier_id: data.dossier_id,
      type:       'status_change',
      title:      `Contract ${data.contract_number} opgezegd`,
      metadata: {
        contract_id:         data.id,
        cancellation_date:   data.cancellation_date,
        cancellation_reason: data.cancellation_reason ?? null,
      },
    });
  }

  return NextResponse.json(data);
}
