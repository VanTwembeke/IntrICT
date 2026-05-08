export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com'}/api/admin/mail-auth/callback`;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error, description: req.nextUrl.searchParams.get('error_description') }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Geen autorisatiecode ontvangen.' }, { status: 400 });
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID!;
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: REDIRECT_URI,
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    }),
  });

  const data = await res.json() as { refresh_token?: string; error?: string; error_description?: string };

  if (!data.refresh_token) {
    return NextResponse.json({ error: data.error ?? 'Token ophalen mislukt.', description: data.error_description }, { status: 500 });
  }

  // Toon het refresh token — kopieer dit naar MICROSOFT_REFRESH_TOKEN in Vercel
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="nl">
    <head><meta charset="utf-8"><title>Refresh Token</title>
    <style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px}
    pre{background:#f1f5f9;padding:16px;border-radius:8px;word-break:break-all;white-space:pre-wrap}
    .label{font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px}
    .warn{background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-top:16px;font-size:13px}
    </style></head>
    <body>
    <h2>✅ Autorisatie geslaagd</h2>
    <p>Kopieer het refresh token hieronder en voeg het toe aan Vercel als <strong>MICROSOFT_REFRESH_TOKEN</strong>.</p>
    <div class="label">MICROSOFT_REFRESH_TOKEN</div>
    <pre>${data.refresh_token}</pre>
    <div class="warn">
      ⚠️ <strong>Beveilig dit token.</strong> Behandel het als een wachtwoord.<br>
      Verwijder daarna de <code>/api/admin/mail-auth</code> endpoints uit de codebase.
    </div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
