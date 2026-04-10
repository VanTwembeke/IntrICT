import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
  const dossier_id = searchParams.get('dossier_id');

  const query = supabase
    .from('activity_logs')
    .select('*, profile:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (dossier_id) query.eq('dossier_id', dossier_id);
  if (!isAdmin) query.eq('profile_id', user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const body = await request.json();
  const { profile_id, dossier_id, type, title, metadata } = body;
  if (!type || !title) return NextResponse.json({ error: 'type en title zijn verplicht.' }, { status: 400 });

  const { data, error } = await supabase
    .from('activity_logs')
    .insert({ profile_id: profile_id ?? user.id, dossier_id: dossier_id ?? null, type, title, metadata: metadata ?? {} })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
