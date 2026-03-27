'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  naam: z.string().min(2, 'Naam is verplicht'),
  email: z.string().email('Ongeldig e-mailadres'),
  telefoon: z.string().optional(),
  onderwerp: z.string().min(1, 'Onderwerp is verplicht'),
  bericht: z.string().min(10, 'Bericht moet minimaal 10 tekens bevatten'),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function sendContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    naam: formData.get('naam') as string,
    email: formData.get('email') as string,
    telefoon: formData.get('telefoon') as string,
    onderwerp: formData.get('onderwerp') as string,
    bericht: formData.get('bericht') as string,
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Ongeldige invoer.',
    };
  }

  const { naam, email, telefoon, onderwerp, bericht } = parsed.data;

  try {
    await resend.emails.send({
      from: 'IntrICT Contact <noreply@intrict.com>',
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
              <td style="padding: 10px 0; color: #1e293b;">${naam}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">E-mail</td>
              <td style="padding: 10px 0; color: #1e293b;">${email}</td>
            </tr>
            ${
              telefoon
                ? `<tr>
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Telefoon</td>
              <td style="padding: 10px 0; color: #1e293b;">${telefoon}</td>
            </tr>`
                : ''
            }
            <tr style="background: #f8fafc;">
              <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Onderwerp</td>
              <td style="padding: 10px 0; color: #1e293b;">${onderwerp}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <p style="font-weight: bold; color: #64748b; margin-bottom: 8px;">Bericht:</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; color: #1e293b; line-height: 1.6;">
              ${bericht.replace(/\n/g, '<br/>')}
            </div>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
            Verstuurd via het contactformulier op intrict.com
          </p>
        </div>
      `,
    });

    // Auto-reply to sender
    await resend.emails.send({
      from: 'IntrICT <noreply@intrict.com>',
      to: email,
      subject: 'We hebben je bericht ontvangen – IntrICT',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Bedankt voor je bericht, ${naam}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            We hebben je bericht goed ontvangen en nemen binnen <strong>24 uur</strong> contact met je op.
          </p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #64748b;">Jouw bericht:</p>
            <p style="margin: 8px 0 0; color: #1e293b; line-height: 1.6;">${bericht.replace(/\n/g, '<br/>')}</p>
          </div>
          <p style="color: #475569;">
            Met vriendelijke groeten,<br/>
            <strong>IntrICT</strong><br/>
            <a href="mailto:info@intrict.com" style="color: #3b82f6;">info@intrict.com</a>
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error('Resend error:', err);
    return {
      success: false,
      error: 'Er is een fout opgetreden. Probeer het later opnieuw of mail ons direct.',
    };
  }
}
