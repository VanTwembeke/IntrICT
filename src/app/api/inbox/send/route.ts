import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const to      = formData.get('to') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const file    = formData.get('file') as File | null;

  if (!to || !subject || !message)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  // ── Find recipient profile ────────────────────────────────────────────────
  const { data: recipient } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', to)
    .maybeSingle<{ id: string }>();

  if (!recipient)
    return NextResponse.json({ error: 'Recipient not found in system' }, { status: 404 });

  // ── Handle file upload to Supabase Storage (optional) ────────────────────
  let fileUrl: string | null = null;
  let fileName: string | null = null;

  if (file && file.size > 0) {
    fileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `messages/${recipient.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments') // create this bucket in Supabase Storage if needed
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }
  }

  // ── Insert into messages table (user sees in their inbox) ─────────────────
  await supabase.from('messages').insert({
    from_id:   user.id,
    to_id:     recipient.id,
    subject,
    body:      message,
    file_name: fileName,
    file_url:  fileUrl,
  });

  // ── Insert notification ───────────────────────────────────────────────────
  const notifType = file && file.size > 0 ? 'file' : 'message';
  await supabase.from('notifications').insert({
    user_id: recipient.id,
    title:   subject,
    body:    message.slice(0, 160) + (message.length > 160 ? '…' : ''),
    type:    notifType,
    link:    '/dashboard/inbox',
  });

  // ── Send email via Resend ─────────────────────────────────────────────────
  const attachments: { filename: string; content: Buffer }[] = [];
  if (file && file.size > 0) {
    attachments.push({ filename: file.name, content: Buffer.from(await file.arrayBuffer()) });
  }

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">${subject}</h2>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:16px 0;">
        <div style="color:#475569;font-size:15px;line-height:1.6;white-space:pre-wrap;">${message}</div>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0 16px;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">Dit bericht werd verstuurd via IntrICT · info@intrict.com</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from:        'IntrICT <info@intrict.com>',
      to:          [to],
      subject,
      html:        htmlBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  } catch (err) {
    // Email failed but message was saved — don't fail the whole request
    console.error('[inbox/send] Resend error:', err);
  }

  return NextResponse.json({ success: true });
}