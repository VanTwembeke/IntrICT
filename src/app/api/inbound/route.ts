import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  let html: string | null = null;
  let text: string | null = null;
  let messageId: string | null = null;
  let inReplyTo: string | null = null;

  try {
    const { data: emailContent, error: fetchError } = await resend.emails.receiving.get(email_id);

    if (fetchError) throw new Error(fetchError.message);

    html       = emailContent?.html        ?? null;
    text       = emailContent?.text        ?? null;
    // message_id is a top-level field on the receiving email object
    messageId  = (emailContent as any)?.message_id ?? null;
    // In-Reply-To lives in the headers object
    inReplyTo  = (emailContent as any)?.headers?.['in-reply-to'] ?? null;

  } catch (err) {
    console.error('Failed to fetch email content:', err);
  }

  // ── 4. Build display body ────────────────────────────────────────────────
  const hasHtml = html && html.trim().length > 0;
  const hasText = text && text.trim().length > 0;

  const emailHtml = hasHtml
    ? html!
    : hasText
    ? `<pre style="font-family:inherit;white-space:pre-wrap;max-width:800px">${escapeHtml(text!)}</pre>`
    : `<p style="color:#999;font-style:italic">(geen inhoud ontvangen)</p>`;

  // ── 5. Resolve thread_id via In-Reply-To ─────────────────────────────────
  // If this email is a reply, find the sent email whose message_id matches
  // In-Reply-To, then use its inbound_email_id as the thread root.
  let threadId: string | null = null;

  if (inReplyTo) {
    // First check if In-Reply-To matches a sent email's message_id
    const { data: parentSent } = await supabase
      .from('sent_emails')
      .select('inbound_email_id')
      .eq('message_id', inReplyTo)
      .maybeSingle();

    if (parentSent?.inbound_email_id) {
      threadId = parentSent.inbound_email_id;
    } else {
      // Fallback: check if In-Reply-To matches an inbound email's message_id directly
      const { data: parentInbound } = await supabase
        .from('inbound_emails')
        .select('id, thread_id')
        .eq('message_id', inReplyTo)
        .maybeSingle();

      if (parentInbound) {
        // Use its thread_id if it has one, otherwise it IS the thread root
        threadId = parentInbound.thread_id ?? parentInbound.id;
      }
    }
  }

  // ── 6. Store in Supabase ─────────────────────────────────────────────────
  const { error: dbError } = await supabase.from('inbound_emails').insert({
    email_id,
    from,
    to:          to ?? [],
    subject:     subject     ?? '(geen onderwerp)',
    html:        emailHtml,
    text:        text        ?? null,
    received_at: created_at  ?? new Date().toISOString(),
    message_id:  messageId,
    in_reply_to: inReplyTo,
    thread_id:   threadId,   // null = this IS a thread root
  });

  if (dbError) {
    console.error('Supabase insert fout:', dbError);
  }

  // ── 7. Only forward emails that are NOT replies to admin-sent messages ────
  // If threadId is set, it's a customer reply — no need to forward,
  // the admin will see it in the thread view on the dashboard.
  if (!threadId) {
    try {
      await resend.emails.send({
        from:    'IntrICT Doorstuur <noreply@intrict.com>',
        to:      'vantwembeke@icloud.com',
        replyTo: from,
        subject: `[IntrICT] ${subject ?? '(geen onderwerp)'}`,
        html:    emailHtml,
      });
    } catch (err) {
      console.error('Resend doorstuur fout:', err);
    }
  }

  return NextResponse.json({ received: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
