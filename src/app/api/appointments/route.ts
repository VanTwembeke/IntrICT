import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/appointments?from=ISO&to=ISO
// Admin: all appointments in range. User: own only.
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  let query = supabase
    .from('appointments')
    .select('*, profile:profiles(full_name, email)')
    .order('starts_at');

  if (!isAdmin) query = query.eq('user_id', user.id);
  if (from)     query = query.gte('starts_at', from);
  if (to)       query = query.lte('starts_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/appointments
// Any authenticated user. Entitlement is checked server-side.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const body: {
    appointment_type_id: string;
    starts_at: string;
    notes?: string;
    user_id?: string; // admin can book on behalf of a user
    meeting_link?: string;
    location?: string;
  } = await request.json();

  // Resolve target user
  const targetUserId = isAdmin && body.user_id ? body.user_id : user.id;

  // Load the appointment type
  const { data: apptType, error: typeErr } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('id', body.appointment_type_id)
    .single();
  if (typeErr || !apptType) return NextResponse.json({ error: 'Onbekend afspraaktype' }, { status: 400 });

  // Entitlement checks (skip for admin)
  if (!isAdmin) {
    // Check max_per_user limit
    if (apptType.max_per_user !== null) {
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('appointment_type_id', body.appointment_type_id)
        .neq('status', 'cancelled');
      if ((count ?? 0) >= apptType.max_per_user) {
        return NextResponse.json(
          { error: `Je hebt het maximum aantal "${apptType.name}" sessies bereikt.` },
          { status: 403 }
        );
      }
    }

    // Check requires_package
    if (apptType.requires_package) {
      const { count } = await supabase
        .from('package_requests')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('status', 'accepted');
      if ((count ?? 0) === 0) {
        return NextResponse.json(
          { error: 'Dit afspraaktype vereist een actief pakket.' },
          { status: 403 }
        );
      }
    }
  }

  const startsAt = new Date(body.starts_at);
  const endsAt   = new Date(startsAt.getTime() + apptType.duration_minutes * 60_000);

  const { data: newAppt, error } = await supabase
    .from('appointments')
    .insert({
      user_id:             targetUserId,
      appointment_type_id: apptType.id,
      type_name:           apptType.name,
      duration_minutes:    apptType.duration_minutes,
      starts_at:           startsAt.toISOString(),
      ends_at:             endsAt.toISOString(),
      notes:               body.notes?.trim() || null,
      meeting_link:        body.meeting_link ?? null,
      location:            body.location ?? null,
      color:               apptType.color,
    })
    .select('*, profile:profiles(full_name, email)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(newAppt, { status: 201 });
}
