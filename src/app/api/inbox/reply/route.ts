import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, subject, message } = await req.json();
  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await resend.emails.send({
    from: 'IntrICT <info@intrict.com>',
    to,
    subject,
    html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
  });

  return NextResponse.json({ success: true });
}