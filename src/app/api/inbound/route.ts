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
  try {
    const event = await request.json();
    if (event.type !== 'email.received') return NextResponse.json({ received: true });

    const { from, subject, html, text } = event.data;

    // ?? misses empty strings — check for actual content
    const emailHtml = html && html.trim().length > 0
      ? html
      : `<pre style="font-family:inherit;white-space:pre-wrap">${text ?? '(geen inhoud)'}</pre>`;

    await supabase.from('inbound_emails').insert({
      from,
      subject: subject ?? '(geen onderwerp)',
      html: emailHtml,
    });

    await resend.emails.send({
      from: 'IntrICT Doorstuur <noreply@intrict.com>',
      to: FORWARD_TO,
      replyTo: from,
      subject: `[IntrICT] ${subject ?? '(geen onderwerp)'}`,
      html: emailHtml,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Inbound webhook error:', err);
    return NextResponse.json({ error: 'Webhook verwerking mislukt' }, { status: 500 });
  }
}