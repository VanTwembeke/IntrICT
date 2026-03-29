import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { to, subject, message } = body;

  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { error } = await resend.emails.send({
    from: 'IntrICT <info@intrict.com>',
    to,
    subject,
    html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
  });

  if (error) {
    console.error('Resend reply error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}