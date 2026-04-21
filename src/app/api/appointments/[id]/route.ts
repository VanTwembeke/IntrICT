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
    cancellation_reason?: string;
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
  if (body.status               !== undefined) update.status               = body.status;
  if (body.admin_notes          !== undefined) update.admin_notes          = body.admin_notes;
  if (body.meeting_link         !== undefined) update.meeting_link         = body.meeting_link;
  if (body.location             !== undefined) update.location             = body.location;
  if (body.notes                !== undefined) update.notes                = body.notes;
  if (body.starts_at            !== undefined) update.starts_at            = body.starts_at;
  if (body.cancellation_reason  !== undefined) update.cancellation_reason  = body.cancellation_reason;
  if (ends_at                   !== undefined) update.ends_at              = ends_at;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .update(update)
    .eq('id', id)
    .select('*, profile:profiles(full_name, email)')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send cancellation email to client when admin cancels with a reason
  if (isAdmin && body.status === 'cancelled' && body.cancellation_reason && process.env.RESEND_API_KEY) {
    try {
      const appt = data as {
        type_name: string;
        starts_at: string;
        guest_email: string | null;
        profile?: { full_name: string | null; email: string } | null;
      };
      const recipientEmail = appt.profile?.email ?? appt.guest_email;
      const recipientName  = appt.profile?.full_name ?? 'Klant';
      const dateLabel = new Date(appt.starts_at).toLocaleDateString('nl-BE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

      if (recipientEmail) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'IntrICT <info@intrict.com>',
          to: recipientEmail,
          subject: `Afspraak geannuleerd: ${appt.type_name}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
              <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b">Afspraak geannuleerd</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:14px">Hallo ${recipientName},</p>
              <p style="margin:0 0 16px;font-size:15px">
                Je afspraak <strong>${appt.type_name}</strong> gepland op <strong>${dateLabel}</strong>
                is helaas geannuleerd door ons.
              </p>
              <div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin:0 0 24px">
                <p style="margin:0;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Reden</p>
                <p style="margin:8px 0 0;font-size:15px;color:#1e293b">${body.cancellation_reason}</p>
              </div>
              <p style="margin:0 0 24px;font-size:15px;color:#475569">
                Neem gerust contact met ons op om een nieuwe afspraak in te plannen.
              </p>
              <a href="mailto:info@intrict.com"
                style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                Contact opnemen
              </a>
              <p style="margin:32px 0 0;font-size:13px;color:#94a3b8">Met vriendelijke groeten,<br/><strong>Het IntrICT-team</strong></p>
            </div>
          `,
        });
      }
    } catch {
      // Email failure is non-fatal — the cancellation still succeeds
    }
  }

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
