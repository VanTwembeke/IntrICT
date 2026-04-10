import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('appointments')
    .select('*, profile:profiles(full_name, email)')
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const body: {
    status?: string;
    admin_notes?: string;
    meeting_link?: string;
    location?: string;
    starts_at?: string;
    notes?: string;
  } = await request.json();

  // Non-admins can only cancel their own pending appointment
  if (!isAdmin) {
    if (body.status !== 'cancelled') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { data: existing } = await supabase
      .from('appointments')
      .select('user_id, status')
      .eq('id', id)
      .single();
    if (!existing || existing.user_id !== user.id || existing.status !== 'pending') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Recalculate ends_at if starts_at changed (admin only)
  let ends_at: string | undefined;
  if (isAdmin && body.starts_at) {
    const { data: existing } = await supabase
      .from('appointments')
      .select('duration_minutes')
      .eq('id', id)
      .single();
    if (existing) {
      const startsAt = new Date(body.starts_at);
      ends_at = new Date(startsAt.getTime() + existing.duration_minutes * 60_000).toISOString();
    }
  }

  const update: Record<string, unknown> = {};
  if (body.status      !== undefined) update.status      = body.status;
  if (body.admin_notes !== undefined) update.admin_notes = body.admin_notes;
  if (body.meeting_link!== undefined) update.meeting_link= body.meeting_link;
  if (body.location    !== undefined) update.location    = body.location;
  if (body.notes       !== undefined) update.notes       = body.notes;
  if (body.starts_at   !== undefined) update.starts_at   = body.starts_at;
  if (ends_at          !== undefined) update.ends_at     = ends_at;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .update(update)
    .eq('id', id)
    .select('*, profile:profiles(full_name, email)')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
