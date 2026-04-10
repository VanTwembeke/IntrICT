import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const query = supabase
    .from('client_dossiers')
    .select(`
      *,
      profile:profiles(full_name, email, phone, company, customer_number),
      packages:dossier_packages(*, package:packages(id, name, price, color))
    `)
    .order('created_at', { ascending: false });

  const { data, error } = isAdmin
    ? await query
    : await query.eq('profile_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const { profile_id, status = 'lead', notes } = body;
  if (!profile_id) return NextResponse.json({ error: 'profile_id is verplicht.' }, { status: 400 });

  const { data, error } = await supabase
    .from('client_dossiers')
    .insert({ profile_id, status, notes: notes ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log activity
  await supabase.from('activity_logs').insert({
    profile_id,
    dossier_id: data.id,
    type: 'status_change',
    title: `Dossier aangemaakt — status: ${status}`,
    metadata: { status },
  });

  return NextResponse.json(data, { status: 201 });
}
