export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 }) };
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return { error: NextResponse.json({ error: 'Geen toegang.' }, { status: 403 }) };
  return { error: null };
}

// GET — lijst alle abonnees
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('newsletter_subscribers')
    .select('id, email, is_active, subscribed_at, unsubscribed_at')
    .order('subscribed_at', { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// DELETE — verwijder abonnee op id
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await request.json() as { id: string };
  if (!id) return NextResponse.json({ error: 'id verplicht.' }, { status: 400 });

  const admin = createAdminClient();
  const { error: dbErr } = await admin
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
