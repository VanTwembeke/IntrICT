import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .order('day_of_week');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const hours: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    break_start: string | null;
    break_end: string | null;
  }> = await request.json();

  const { error } = await supabase.from('working_hours').upsert(
    hours.map((h) => ({ ...h, updated_at: new Date().toISOString() })),
    { onConflict: 'day_of_week' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
