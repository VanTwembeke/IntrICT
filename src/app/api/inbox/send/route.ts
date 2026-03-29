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
  const to      = formData.get('to') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const file    = formData.get('file') as File | null;

  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data: recipient } = await supabase
    .from('profiles').select('id').eq('email', to).single();
  if (!recipient)
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

  // ── Upload attachment ────────────────────────────────────────────────────
  let file_url: string | null = null;
  let file_name: string | null = null;
  let attachments: { filename: string; content: Buffer }[] = [];

  if (file && file.size > 0) {
    file_name = file.name;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage for the portal link
    const { data: upload, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(`${crypto.randomUUID()}-${file_name}`, buffer, { contentType: file.type });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    } else if (upload) {
      const { data: { publicUrl } } = supabase.storage
        .from('attachments').getPublicUrl(upload.path);
      file_url = publicUrl;
    }

    // Also attach to the Resend email
    attachments = [{ filename: file_name, content: buffer }];
  }

  // ── Insert message (always include file fields) ──────────────────────────
  const { error: insertError } = await supabase.from('messages').insert({
    from_id:   user.id,
    to_id:     recipient.id,
    subject,
    body:      message,
    file_name: file_name,   // null if no file — explicit is better than omitting
    file_url:  file_url,
  });

  if (insertError) {
    console.error('Insert failed:', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // ── Notification for customer ────────────────────────────────────────────
  await supabase.from('notifications').insert({
    user_id: recipient.id,
    title:   subject,
    body:    message.slice(0, 100),
    type:    'message',
    read:    false,
    link:    '/dashboard/berichten',
  });

  // ── Send email via Resend ────────────────────────────────────────────────
  const { error: sendError } = await resend.emails.send({
    from: 'IntrICT <noreply@intrict.com>',
    to,
    subject,
    html: `
      <p>${message.replace(/\n/g, '<br/>')}</p>
      ${file_url ? `<p><a href="${file_url}">📎 ${file_name}</a></p>` : ''}
    `,
    ...(attachments.length > 0 && { attachments }),
  });

  if (sendError) {
    console.error('Resend error:', sendError);
    // Message is already saved — don't fail the whole request
  }

  return NextResponse.json({ success: true });
}