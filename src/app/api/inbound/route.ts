import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FORWARD_TO = 'vantwembeke@icloud.com';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    if (event.type !== 'email.received') {
      return NextResponse.json({ received: true });
    }

    const { from, subject, html, text } = event.data;

    await resend.emails.send({
      from: 'IntrICT Doorstuur <noreply@intrict.com>',
      to: FORWARD_TO,
      replyTo: from,
      subject: `[IntrICT] ${subject ?? '(geen onderwerp)'}`,
      html: html ?? `<pre>${text ?? ''}</pre>`,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Inbound webhook error:', err);
    return NextResponse.json({ error: 'Webhook verwerking mislukt' }, { status: 500 });
  }
}
