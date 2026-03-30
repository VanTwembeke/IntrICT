import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { to, subject, message, inbound_email_id } = body;

  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // ── Send via Resend and capture the returned message_id ─────────────────
  const { data: sent, error } = await resend.emails.send({
    from:    'IntrICT <info@intrict.com>',
    to,
    subject,
    html:    `<p>${message.replace(/\n/g, '<br/>')}</p>`,
  });

  if (error) {
    console.error('Resend reply error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Fetch the sent email to get its Message-ID header ───────────────────
  // Resend returns an `id` (their internal UUID), but the actual SMTP
  // Message-ID (used by email clients for In-Reply-To) must be fetched.
  let smtpMessageId: string | null = null;
  if (sent?.id) {
    try {
      const { data: sentEmail } = await resend.emails.get(sent.id);
      // The message_id field contains the SMTP Message-ID angle-bracket string
      smtpMessageId = (sentEmail as any)?.message_id ?? null;
    } catch (err) {
      console.error('Could not fetch sent message_id:', err);
    }
  }

  // ── Persist reply with thread link and message_id ────────────────────────
  const { error: dbError } = await supabase.from('sent_emails').insert({
    sent_by:          user.id,
    to_email:         to,
    subject,
    message,
    inbound_email_id: inbound_email_id ?? null,
    message_id:       smtpMessageId,
  });

  if (dbError) {
    console.error('Failed to save reply to sent_emails:', dbError);
  }

  return NextResponse.json({ success: true });
}
