export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const admin = createAdminClient();
  const { data: newsletter } = await admin
    .from('newsletters')
    .select('resend_broadcast_id, recipient_count, sent_at')
    .eq('id', id)
    .single();

  if (!newsletter) return NextResponse.json({ error: 'Niet gevonden.' }, { status: 404 });

  if (!newsletter.resend_broadcast_id) {
    return NextResponse.json({
      recipient_count: newsletter.recipient_count ?? 0,
      metrics: null,
    });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: broadcast } = await (resend.broadcasts as any).get(newsletter.resend_broadcast_id);
    return NextResponse.json({
      recipient_count: newsletter.recipient_count ?? broadcast?.metrics?.deliveries ?? 0,
      metrics: broadcast?.metrics ?? null,
    });
  } catch {
    return NextResponse.json({
      recipient_count: newsletter.recipient_count ?? 0,
      metrics: null,
    });
  }
}
