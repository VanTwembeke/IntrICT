export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  // Verify caller is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const { email } = await request.json() as { email: string };
  if (!email?.includes('@')) return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });

  // Generate a recovery link via admin (does not auto-send email)
  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.be';

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${siteUrl}/dashboard/settings` },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: linkErr?.message ?? 'Link genereren mislukt.' }, { status: 500 });
  }

  const actionLink = linkData.properties.action_link;

  // Send via Resend
  try {
    await resend.emails.send({
      from: 'IntrICT <hello@intrict.be>',
      to: email,
      subject: 'Wachtwoord instellen — IntrICT',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1e293b;">
          <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;">Wachtwoord instellen</h1>
          <p style="color:#475569;line-height:1.6;margin-bottom:24px;">
            Je ontving deze e-mail van IntrICT. Klik op de knop hieronder om je wachtwoord in te stellen
            en toegang te krijgen tot je account.
          </p>
          <a href="${actionLink}"
             style="display:inline-block;padding:13px 28px;background:#0f172a;color:white;
                    text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">
            Wachtwoord instellen →
          </a>
          <p style="margin-top:28px;font-size:12px;color:#94a3b8;">
            Deze link is 24 uur geldig. Heb je deze e-mail niet verwacht? Je kunt hem negeren.
          </p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Resend not available — return the link so the admin can share it manually
    return NextResponse.json({ ok: true, link: actionLink });
  }
}
