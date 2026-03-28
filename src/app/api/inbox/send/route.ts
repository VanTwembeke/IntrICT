import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // ── Auth: only admins can send ────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Parse multipart form ──────────────────────────────────────────────────
  const formData = await req.formData();
  const to      = formData.get('to') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const file    = formData.get('file') as File | null;

  if (!to || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ── Build email ───────────────────────────────────────────────────────────
  const attachments: { filename: string; content: Buffer }[] = [];
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({ filename: file.name, content: buffer });
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
    // ── Send via Resend ────────────────────────────────────────────────────
    await resend.emails.send({
      from:        'IntrICT <info@intrict.com>',
      to:          [to],
      subject,
      html:        htmlBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // ── Find the recipient's profile to create a notification ─────────────
    const { data: recipient } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', to)
      .maybeSingle<{ id: string }>();

    if (recipient) {
      const notifType = file && file.size > 0 ? 'file' : 'message';
      await supabase.from('notifications').insert({
        user_id: recipient.id,
        title:   subject,
        body:    message.slice(0, 160) + (message.length > 160 ? '…' : ''),
        type:    notifType,
        link:    '/dashboard/inbox',
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[inbox/send]', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}