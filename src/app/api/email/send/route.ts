export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@/lib/supabase/server';
import { sendMail } from '@/lib/mailer';

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

    // Parse form data for attachments
    const formData = await req.formData();
    const recipientEmail = formData.get('recipientEmail') as string;
    const recipientName = formData.get('recipientName') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const includeCta = formData.get('includeCta') === 'true';
    const ctaText = formData.get('ctaText') as string;
    const ctaUrl = formData.get('ctaUrl') as string;
    const includeAdditionalContent = formData.get('includeAdditionalContent') === 'true';
    const additionalContent = formData.get('additionalContent') as string;
    const includeDisclaimer = formData.get('includeDisclaimer') === 'true';

    // Template customization fields
    const headerSubtitle = formData.get('headerSubtitle') as string;
    const greeting = formData.get('greeting') as string;
    const signatureName = formData.get('signatureName') as string;
    const signatureTitle = formData.get('signatureTitle') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const contactAddress = formData.get('contactAddress') as string;
    const companyName = formData.get('companyName') as string;
    const companyTagline = formData.get('companyTagline') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    const websiteDisplay = formData.get('websiteDisplay') as string;

    // Process attachments — convert to base64 for Graph API
    const attachmentFiles = formData.getAll('attachments') as File[];
    const attachments = await Promise.all(
      attachmentFiles
        .filter((f) => f && f.size > 0)
        .map(async (f) => ({
          name: f.name,
          contentBytes: Buffer.from(await f.arrayBuffer()).toString('base64'),
          contentType: f.type || 'application/octet-stream',
        }))
    );

    if (!recipientEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read email template
    const templatePath = join(process.cwd(), 'src/templates/emailTemplate.html');
    let htmlContent = readFileSync(templatePath, 'utf-8');

    // Replace template variables
    let ctaSection = '';
    if (includeCta && ctaText && ctaUrl) {
      ctaSection = `
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
      </div>`;
    }

    let additionalContentSection = '';
    if (includeAdditionalContent && additionalContent) {
      additionalContentSection = `
      <div class="additional-content">
        ${additionalContent.replace(/\n/g, '<br />')}
      </div>`;
    }

    let disclaimerSection = '';
    if (includeDisclaimer) {
      disclaimerSection = `
      <div class="disclaimer">
        <strong>Belangrijke informatie:</strong> Dit is een automatisch gegenereerd e-mailbericht.
        Antwoord alstublieft niet direct op deze e-mail. Voor vragen kunt u contact opnemen via ${contactEmail}.
      </div>`;
    }

    htmlContent = htmlContent
      .replace(/\{\{SUBJECT\}\}/g, subject)
      .replace(/\{\{HEADER_SUBTITLE\}\}/g, headerSubtitle || 'Professioneel bericht')
      .replace(/\{\{GREETING\}\}/g, greeting || `Hallo <strong>${recipientName || 'Gebruiker'}</strong>,`)
      .replace(/\{\{RECIPIENT_NAME\}\}/g, recipientName || 'Gebruiker')
      .replace(/\{\{MESSAGE\}\}/g, message.replace(/\n/g, '<br />'))
      .replace(/\{\{SIGNATURE_NAME\}\}/g, signatureName || 'Jonas')
      .replace(/\{\{SIGNATURE_TITLE\}\}/g, signatureTitle || 'Oprichter & CEO')
      .replace(/\{\{CONTACT_EMAIL\}\}/g, contactEmail || 'info@intrict.com')
      .replace(/\{\{CONTACT_PHONE\}\}/g, contactPhone || '+32 123 45 67 89')
      .replace(/\{\{CONTACT_ADDRESS\}\}/g, contactAddress || 'Gent, België')
      .replace(/\{\{COMPANY_NAME\}\}/g, companyName || 'IntrICT')
      .replace(/\{\{COMPANY_TAGLINE\}\}/g, companyTagline || 'Moderne websites die werken')
      .replace(/\{\{WEBSITE_URL\}\}/g, websiteUrl || 'https://intrict.com')
      .replace(/\{\{WEBSITE_DISPLAY\}\}/g, websiteDisplay || 'www.intrict.com')
      .replace(/\{\{CURRENT_YEAR\}\}/g, new Date().getFullYear().toString())
      .replace(/\{\{CTA_SECTION\}\}/g, ctaSection)
      .replace(/\{\{ADDITIONAL_CONTENT\}\}/g, additionalContentSection)
      .replace(/\{\{DISCLAIMER\}\}/g, disclaimerSection);

    await sendMail({
      from: 'jonas@intrict.com',
      to: recipientEmail,
      replyTo: user.email || 'noreply@intrict.com',
      subject,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return NextResponse.json({
      success: true,
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
