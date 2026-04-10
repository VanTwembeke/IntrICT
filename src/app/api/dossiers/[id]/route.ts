import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return p?.role === 'admin' ? user : null;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data, error } = await supabase
    .from('client_dossiers')
    .select(`
      *,
      profile:profiles(full_name, email, phone, company, vat_number, address, postal_code, city, customer_number),
      packages:dossier_packages(*, package:packages(id, name, price, color, description))
    `)
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const { status, notes } = body;

  // Fetch current dossier to detect status change
  const { data: current } = await supabase.from('client_dossiers').select('status, profile_id').eq('id', id).single();

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from('client_dossiers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status change
  if (status && current && status !== current.status) {
    await supabase.from('activity_logs').insert({
      profile_id: current.profile_id,
      dossier_id: id,
      type: 'status_change',
      title: `Status gewijzigd: ${current.status} → ${status}`,
      metadata: { from: current.status, to: status },
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const { error } = await supabase.from('client_dossiers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// ── Dossier packages sub-routes ───────────────────────────────────────────────

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const { action, package_id, is_recurring } = body;

  if (action === 'add_package') {
    const { data: dossier } = await supabase.from('client_dossiers').select('profile_id').eq('id', id).single();
    const { data, error } = await supabase
      .from('dossier_packages')
      .insert({ dossier_id: id, package_id, is_recurring: is_recurring ?? false })
      .select('*, package:packages(id, name, price, color)')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('activity_logs').insert({
      profile_id: dossier?.profile_id ?? null,
      dossier_id: id,
      type: 'package_request',
      title: `Pakket toegevoegd aan dossier`,
      metadata: { package_id },
    });
    return NextResponse.json(data, { status: 201 });
  }

  if (action === 'remove_package') {
    const { error } = await supabase.from('dossier_packages').delete().eq('id', package_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Onbekende actie.' }, { status: 400 });
}
