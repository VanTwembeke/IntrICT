'use server';

import { z } from 'zod';
import { sendMail } from '@/lib/mailer';

import { CONTACT_LIMITS as limits } from '@/lib/contact-form';

function contactSchema(en: boolean) {
  const bounded = (max: number) => z.string().max(max).trim();
  return z.object({
    naam: bounded(limits.naam.max).min(limits.naam.min, en ? 'Name must contain at least 2 characters.' : 'Naam moet minimaal 2 tekens bevatten.'),
    email: bounded(limits.email.max).email(en ? 'Enter a valid email address.' : 'Vul een geldig e-mailadres in.'),
    telefoon: bounded(limits.telefoon.max).optional(),
    onderwerp: bounded(limits.onderwerp.max).min(limits.onderwerp.min, en ? 'Choose a subject.' : 'Kies een onderwerp.'),
    bericht: bounded(limits.bericht.max).min(limits.bericht.min, en ? 'Message must contain at least 10 characters.' : 'Bericht moet minimaal 10 tekens bevatten.'),
  });
}

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function sendContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Locale is presentation-only, allowlisted and supplied by the language context.
  const en = formData.get('locale') === 'en';
  const raw = {
    naam: formData.get('naam'),
    email: formData.get('email'),
    telefoon: formData.get('telefoon') ?? undefined,
    onderwerp: formData.get('onderwerp'),
    bericht: formData.get('bericht'),
  };

  const parsed = contactSchema(en).safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: (() => {
        const issue = parsed.error.issues[0];
        const field = String(issue?.path[0] ?? '');
        const labels: Record<string, string> = en
          ? { naam: 'Name', email: 'Email address', telefoon: 'Phone number', onderwerp: 'Subject', bericht: 'Message' }
          : { naam: 'Naam', email: 'E-mailadres', telefoon: 'Telefoonnummer', onderwerp: 'Onderwerp', bericht: 'Bericht' };
        if (issue?.code === 'too_big') return en
          ? `${labels[field]} must contain no more than ${issue.maximum} characters.`
          : `${labels[field]} mag maximaal ${issue.maximum} tekens bevatten.`;
        if (issue?.code === 'invalid_type') return en ? 'Please complete the form with valid text.' : 'Vul het formulier in met geldige tekst.';
        return issue?.message ?? (en ? 'Invalid input.' : 'Ongeldige invoer.');
      })(),
    };
  }

  const { naam, email, telefoon, onderwerp, bericht } = parsed.data;
  const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const safe = {
    naam: escapeHtml(naam), email: escapeHtml(email),
    telefoon: escapeHtml(telefoon ?? ''), onderwerp: escapeHtml(onderwerp),
    bericht: escapeHtml(bericht).replace(/\r\n|\r|\n/g, '<br/>'),
  };

  try {
    await Promise.all([
      // Notificatie aan admin
      sendMail({
        to: 'info@intrict.com',
        replyTo: email,
        subject: `Nieuw contactformulier: ${onderwerp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
              Nieuw bericht via IntrICT.com
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 130px;">Naam</td>
                <td style="padding: 10px 0; color: #1e293b;">${safe.naam}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">E-mail</td>
                <td style="padding: 10px 0; color: #1e293b;">${safe.email}</td>
              </tr>
              ${
                telefoon
                  ? `<tr>
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Telefoon</td>
                <td style="padding: 10px 0; color: #1e293b;">${safe.telefoon}</td>
              </tr>`
                  : ''
              }
              <tr style="background: #f8fafc;">
                <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Onderwerp</td>
                <td style="padding: 10px 0; color: #1e293b;">${safe.onderwerp}</td>
              </tr>
            </table>
            <div style="margin-top: 20px;">
              <p style="font-weight: bold; color: #64748b; margin-bottom: 8px;">Bericht:</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e293b; line-height: 1.6;">
                ${safe.bericht}
              </div>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
              Verstuurd via het contactformulier op intrict.com
            </p>
          </div>
        `,
      }),
      // Automatisch antwoord aan bezoeker
      sendMail({
        to: email,
        subject: en ? 'We have received your message – IntrICT' : 'We hebben je bericht ontvangen – IntrICT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">${en ? 'Thank you for your message' : 'Bedankt voor je bericht'}, ${safe.naam}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              ${en ? 'We have received your message and will contact you within <strong>24 hours</strong>.' : 'We hebben je bericht goed ontvangen en nemen binnen <strong>24 uur</strong> contact met je op.'}
            </p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #64748b;">${en ? 'Your message:' : 'Jouw bericht:'}</p>
              <p style="margin: 8px 0 0; color: #1e293b; line-height: 1.6;">${safe.bericht}</p>
            </div>
            <p style="color: #475569;">
              ${en ? 'Kind regards,' : 'Met vriendelijke groeten,'}<br/>
              <strong>IntrICT</strong><br/>
              <a href="mailto:info@intrict.com" style="color: #3b82f6;">info@intrict.com</a>
            </p>
          </div>
        `,
      }),
    ]);

    return { success: true };
  } catch (err) {
    console.error('Mail error:', err);
    return {
      success: false,
      error: en ? 'Your message could not be sent. Please try again later or email us directly.' : 'Je bericht kon niet worden verstuurd. Probeer het later opnieuw of mail ons direct.',
    };
  }
}
