import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can send emails
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can send emails' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      recipientEmail,
      recipientName,
      subject,
      message,
      senderName,
      senderCompany,
    } = body;

    if (!recipientEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Import and initialize Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Read email template
    const templatePath = join(process.cwd(), 'src/templates/emailTemplate.html');
    let htmlContent = readFileSync(templatePath, 'utf-8');

    // Replace template variables
    htmlContent = htmlContent
      .replace('{{SUBJECT}}', subject)
      .replace('{{SENDER_NAME}}', senderName || 'Administrator')
      .replace('{{RECIPIENT_NAME}}', recipientName || 'Gebruiker')
      .replace('{{MESSAGE}}', message.replace(/\n/g, '<br />'))
      .replace('{{SENDER_COMPANY}}', senderCompany || 'N/A')
      .replace('{{APP_NAME}}', 'Communicatie Platform');

    // Send email via Resend
    const response = await resend.emails.send({
      from: 'info@intrict.com',
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      replyTo: user.email || 'noreply@intrict.com',
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: response.data?.id,
      message: 'Email succesvol verstuurd',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
