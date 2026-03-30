import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FORWARD_TO = 'vantwembeke@icloud.com';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // ── 1. Verify webhook signature ──────────────────────────────────────────
  const rawBody = await request.text();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      resend.webhooks.verify({
        payload: rawBody,
        headers: {
          id:        request.headers.get('svix-id')        ?? '',
          timestamp: request.headers.get('svix-timestamp') ?? '',
          signature: request.headers.get('svix-signature') ?? '',
        },
        webhookSecret,
      });
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Ongeldige webhook handtekening' }, { status: 401 });
    }
  }

  // ── 2. Parse event ───────────────────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON payload' }, { status: 400 });
  }

  if (event.type !== 'email.received') {
    return NextResponse.json({ received: true });
  }

  const data = event.data as {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    created_at: string;
  };

  const { email_id, from, to, subject, created_at } = data;

  if (!email_id) {
    console.error('Missing email_id in webhook payload:', event);
    return NextResponse.json({ error: 'Ontbrekende email_id' }, { status: 400 });
  }

  // ── 3. Fetch full email content via Resend API ───────────────────────────
  // The webhook payload NEVER contains the body — it must be fetched separately.
  let html: string | null = null;
  let text: string | null = null;

  try {
    const { data: emailContent, error: fetchError } = await resend.emails.receiving.get(email_id);

    if (fetchError) {
      console.error('Resend email fetch error:', fetchError);
      throw new Error(fetchError.message);
    }

    html = emailContent?.html ?? null;
    text = emailContent?.text ?? null;
  } catch (err) {
    console.error('Failed to fetch email content:', err);
    // Continue — store what we have, don't drop the event entirely
  }
  console.log('EMAIL CONTENT KEYS:', Object.keys(emailContent ?? {}));
  console.log('EMAIL HEADERS:', JSON.stringify((emailContent as any)?.headers, null, 2));
  console.log('FULL PAYLOAD:', JSON.stringify(emailContent, null, 2));

  // ── 4. Build display body ────────────────────────────────────────────────
  const hasHtml = html && html.trim().length > 0;
  const hasText = text && text.trim().length > 0;

  const emailHtml = hasHtml
    ? html!
    : hasText
    ? `<pre style="font-family:inherit;white-space:pre-wrap;max-width:800px">${escapeHtml(text!)}</pre>`
    : `<p style="color:#999;font-style:italic">(geen inhoud ontvangen)</p>`;

  // ── 5. Store in Supabase ─────────────────────────────────────────────────
  const { error: dbError } = await supabase.from('inbound_emails').insert({
    email_id,
    from,
    to: to ?? [],
    subject:    subject    ?? '(geen onderwerp)',
    html:       emailHtml,
    text:       text       ?? null,
    received_at: created_at ?? new Date().toISOString(),
  });

  if (dbError) {
    console.error('Supabase insert fout:', dbError);
    // Don't return 500 — still try to forward
  }

  // ── 6. Forward via Resend ────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from:    'IntrICT Doorstuur <noreply@intrict.com>',
      to:      FORWARD_TO,
      replyTo: from,
      subject: `[IntrICT] ${subject ?? '(geen onderwerp)'}`,
      html:    emailHtml,
    });
  } catch (err) {
    console.error('Resend doorstuur fout:', err);
    return NextResponse.json({ error: 'Doorsturen mislukt' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Prevent XSS when falling back to plain text
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
