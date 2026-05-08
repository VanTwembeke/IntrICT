export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMail } from '@/lib/mailer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com';

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, error: NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 }) };
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return { userId: null, error: NextResponse.json({ error: 'Geen toegang.' }, { status: 403 }) };
  return { userId: user.id, error: null };
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function buildNewsletterHtml(data: {
  subject: string;
  preheader?: string;
  headline: string;
  body: string;
  featureTitle?: string;
  featureBody?: string;
  ctaText?: string;
  ctaUrl?: string;
  subscriberEmail?: string;
}): string {
  const date = new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
  const email = data.subscriberEmail ?? '{{email}}';

  const paragraphs = data.body
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.75;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const featureBlock = data.featureTitle
    ? `<tr><td style="padding:0 40px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
          <tr><td style="padding:24px;">
            <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#2563eb;">Uitgelicht</p>
            <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#1e3a5f;line-height:1.3;">${data.featureTitle}</h2>
            ${data.featureBody ? `<p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${data.featureBody.replace(/\n/g, '<br>')}</p>` : ''}
          </td></tr>
        </table>
      </td></tr>`
    : '';

  const ctaBlock = data.ctaText && data.ctaUrl
    ? `<tr><td style="padding:0 40px 32px;" align="center">
        <a href="${data.ctaUrl}" style="display:inline-block;padding:14px 36px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:-0.2px;">${data.ctaText} &#8594;</a>
      </td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">${data.preheader ?? ''}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-size:21px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IntrICT</span><span style="font-size:11px;color:rgba(255,255,255,0.55);margin-left:8px;font-weight:500;">Nieuwsbrief</span></td>
                <td align="right"><span style="font-size:11px;color:rgba(255,255,255,0.45);">${date}</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Headline + body -->
        <tr>
          <td style="padding:40px 40px 28px;">
            <h1 style="margin:0 0 20px;font-size:27px;font-weight:800;color:#0f172a;line-height:1.25;letter-spacing:-0.5px;">${data.headline}</h1>
            ${paragraphs}
          </td>
        </tr>

        ${featureBlock}
        ${ctaBlock}

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:22px 40px;background:#f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">Je ontvangt deze e-mail omdat je ingeschreven bent voor de IntrICT nieuwsbrief.</p>
                  <p style="margin:0;font-size:11px;color:#94a3b8;"><a href="${SITE_URL}/uitschrijven?email=${encodeURIComponent(email)}" style="color:#64748b;text-decoration:underline;">Uitschrijven</a>&nbsp;&middot;&nbsp;<a href="${SITE_URL}" style="color:#64748b;text-decoration:underline;">intrict.com</a></p>
                </td>
                <td align="right" style="vertical-align:top;">
                  <p style="margin:0;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:0.5px;">INTRICT BV</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── GET — list newsletters ───────────────────────────────────────────────────

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from('newsletters')
    .select('id, subject, headline, status, sent_at, recipient_count, created_at')
    .order('created_at', { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ─── POST — send newsletter ───────────────────────────────────────────────────

export async function POST(request: Request) {
  const { userId, error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json() as {
    subject: string;
    preheader?: string;
    headline: string;
    body: string;
    feature_title?: string;
    feature_body?: string;
    cta_text?: string;
    cta_url?: string;
  };

  if (!body.subject?.trim()) return NextResponse.json({ error: 'Onderwerp is verplicht.' }, { status: 400 });
  if (!body.headline?.trim()) return NextResponse.json({ error: 'Koptekst is verplicht.' }, { status: 400 });
  if (!body.body?.trim()) return NextResponse.json({ error: 'Inhoud is verplicht.' }, { status: 400 });

  const admin = createAdminClient();

  // Haal actieve abonnees op
  const { data: subscribers, error: subsErr } = await admin
    .from('newsletter_subscribers')
    .select('email')
    .eq('is_active', true);

  if (subsErr) return NextResponse.json({ error: subsErr.message }, { status: 500 });
  if (!subscribers?.length) {
    return NextResponse.json({ error: 'Geen actieve abonnees.' }, { status: 400 });
  }

  // Stuur naar elke abonnee individueel (eigen uitschrijflink)
  let sentCount = 0;
  const errors: string[] = [];

  for (const { email } of subscribers) {
    const html = buildNewsletterHtml({
      subject: body.subject,
      preheader: body.preheader,
      headline: body.headline,
      body: body.body,
      featureTitle: body.feature_title,
      featureBody: body.feature_body,
      ctaText: body.cta_text,
      ctaUrl: body.cta_url,
      subscriberEmail: email,
    });

    try {
      await sendMail({
        from: 'jonas@intrict.com',
        to: email,
        subject: body.subject,
        html,
      });
      sentCount++;
    } catch (err) {
      errors.push(`${email}: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
    }
  }

  // Sla op in DB
  const { data: newsletter, error: dbErr } = await admin
    .from('newsletters')
    .insert({
      subject: body.subject,
      preheader: body.preheader ?? null,
      headline: body.headline,
      body: body.body,
      feature_title: body.feature_title ?? null,
      feature_body: body.feature_body ?? null,
      cta_text: body.cta_text ?? null,
      cta_url: body.cta_url ?? null,
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: sentCount,
      created_by: userId,
    })
    .select()
    .single();

  if (dbErr) {
    console.error('DB insert failed after send:', dbErr.message);
    return NextResponse.json({ ok: true, sent: sentCount, warning: 'Verzonden maar niet opgeslagen in DB.', errors });
  }

  return NextResponse.json({ ok: true, newsletter, sent: sentCount, errors });
}
