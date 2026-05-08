export const runtime = 'nodejs';

// Eenmalige autorisatiepagina om een refresh token te verkrijgen.
// Bezoek /api/admin/mail-auth als admin om de OAuth2-flow te starten.
// Na autorisatie zie je het refresh token — kopieer het naar MICROSOFT_REFRESH_TOKEN in Vercel.
// Verwijder dit endpoint daarna uit de codebase.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com'}/api/admin/mail-auth/callback`;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const tenantId = process.env.MICROSOFT_TENANT_ID!;
  const clientId = process.env.MICROSOFT_CLIENT_ID!;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    response_mode: 'query',
    prompt: 'consent',
  });

  return NextResponse.redirect(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`
  );
}
