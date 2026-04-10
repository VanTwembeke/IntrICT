import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  let query = supabase
    .from('time_logs')
    .select('*, profile:profiles(full_name, email)')
    .order('logged_date', { ascending: false })
    .order('created_at',  { ascending: false });

  if (!isAdmin) {
    query = query.eq('user_id', user.id);
  } else if (userId) {
    query = query.eq('user_id', userId);
  }
  if (from) query = query.gte('logged_date', from);
  if (to)   query = query.lte('logged_date', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body: {
    user_id: string;
    logged_date: string;
    duration_minutes: number;
    description?: string;
    billable?: boolean;
  } = await request.json();

  const { data, error } = await supabase
    .from('time_logs')
    .insert({
      user_id:          body.user_id,
      logged_date:      body.logged_date,
      duration_minutes: body.duration_minutes,
      description:      body.description?.trim() || null,
      billable:         body.billable ?? true,
    })
    .select('*, profile:profiles(full_name, email)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
