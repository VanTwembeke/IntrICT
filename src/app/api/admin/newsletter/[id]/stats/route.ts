export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
    .select('recipient_count, sent_at')
    .eq('id', id)
    .single();

  if (!newsletter) return NextResponse.json({ error: 'Niet gevonden.' }, { status: 404 });

  return NextResponse.json({
    recipient_count: newsletter.recipient_count ?? 0,
    metrics: null, // open/click tracking niet beschikbaar via Microsoft 365
  });
}
