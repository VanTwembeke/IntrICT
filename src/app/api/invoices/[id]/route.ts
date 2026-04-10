import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city, phone),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const allowed = ['status', 'notes', 'due_date', 'is_recurring', 'recurring_interval'];
  const updates: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) updates[k] = body[k];

  // Fetch current for activity log
  const { data: current } = await supabase.from('invoices').select('status, profile_id, dossier_id, invoice_number').eq('id', id).single();

  const { data, error } = await supabase
    .from('invoices').update(updates).eq('id', id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status changes
  if (updates.status && current && updates.status !== current.status) {
    await supabase.from('activity_logs').insert({
      profile_id: current.profile_id,
      dossier_id: current.dossier_id ?? null,
      type: 'status_change',
      title: `Factuur ${current.invoice_number}: ${current.status} → ${updates.status}`,
      metadata: { invoice_id: id, from: current.status, to: updates.status },
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
