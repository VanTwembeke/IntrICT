import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const to = formData.get('to') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const file = formData.get('file') as File | null;

  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // Look up recipient profile id
  const { data: recipient } = await supabase
    .from('profiles').select('id').eq('email', to).single();
  if (!recipient)
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

  // Optional: upload file to Supabase Storage
  let file_url: string | null = null;
  let file_name: string | null = null;
  if (file && file.size > 0) {
    file_name = file.name;
    const bytes = await file.arrayBuffer();
    const { data: upload } = await supabase.storage
      .from('attachments')
      .upload(`${crypto.randomUUID()}-${file_name}`, bytes, {
        contentType: file.type,
      });
    if (upload) {
      const { data: { publicUrl } } = supabase.storage
        .from('attachments').getPublicUrl(upload.path);
      file_url = publicUrl;
    }
  }

  // Save to messages table
  await supabase.from('messages').insert({
    from_id: user.id,
    to_id: recipient.id,
    subject,
    body: message,
    file_name,
    file_url,
  });

  // Send actual email via Resend
  await resend.emails.send({
    from: 'IntrICT <noreply@intrict.com>',
    to,
    subject,
    html: `
      <p>${message.replace(/\n/g, '<br/>')}</p>
      ${file_url ? `<p><a href="${file_url}">📎 ${file_name}</a></p>` : ''}
    `,
  });

  return NextResponse.json({ success: true });
}