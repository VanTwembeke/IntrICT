export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
const unavailable = () => reply({ error: 'Abonnees konden niet worden verwerkt.' }, 500);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return [400, 401, 403].includes(authError.status ?? 0)
      ? reply({ error: 'Niet ingelogd.' }, 401) : unavailable();
  }
  if (!user) return reply({ error: 'Niet ingelogd.' }, 401);
  const { data: me, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (error || !me) return unavailable();
  if (me.role !== 'admin') return reply({ error: 'Geen toegang.' }, 403);
  return null;
}

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const admin = createAdminClient();
    const { data, error } = await admin.from('newsletter_subscribers')
      .select('id, email, is_active, subscribed_at, unsubscribed_at')
      .order('subscribed_at', { ascending: false });
    if (error || !Array.isArray(data)) return unavailable();
    return reply(data);
  } catch {
    return unavailable();
  }
}

export async function DELETE(request: Request) {
  try {
    // Cookie-authenticated destructive requests must come from this website.
    const origin = request.headers.get('origin');
    const site = request.headers.get('sec-fetch-site');
    if (origin !== new URL(request.url).origin || (site && site !== 'same-origin')) {
      return reply({ error: 'Alleen aanvragen vanaf dezelfde website zijn toegestaan.' }, 403);
    }
    const denied = await requireAdmin();
    if (denied) return denied;
    let body;
    try { body = await request.json(); } catch { return reply({ error: 'Ongeldig verzoek.' }, 400); }
    const id = body?.id;
    if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return reply({ error: 'Geldig id verplicht.' }, 400);
    }
    const admin = createAdminClient();
    const { data, error } = await admin.from('newsletter_subscribers').delete().eq('id', id.toLowerCase()).select('id').maybeSingle();
    if (error) return unavailable();
    if (!data) return reply({ error: 'Abonnee niet gevonden. Vernieuw het overzicht.' }, 404);
    if (data.id !== id.toLowerCase()) return unavailable();
    return reply({ ok: true });
  } catch {
    return unavailable();
  }
}
