'use server';

import { Resend } from 'resend';

export type NewsletterState = {
  success: boolean;
  error?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? '';

export async function updateNewsletterSubscription(email: string, subscribe: boolean): Promise<NewsletterState> {
  if (!AUDIENCE_ID) return { success: false, error: 'Nieuwsbrief service niet beschikbaar.' };
  try {
    const { error } = await resend.contacts.create({
      email: email.trim().toLowerCase(),
      audienceId: AUDIENCE_ID,
      unsubscribed: !subscribe,
    });
    if (error && !error.message?.toLowerCase().includes('already exists')) {
      return { success: false, error: 'Kon nieuwsbrief voorkeur niet opslaan.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Er is iets misgegaan.' };
  }
}

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Voer een geldig e-mailadres in.' };
  }

  const trimmed = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { success: false, error: 'Voer een geldig e-mailadres in.' };
  }

  if (!AUDIENCE_ID) {
    console.error('RESEND_AUDIENCE_ID is not set');
    return { success: false, error: 'Er is iets misgegaan. Probeer het later opnieuw.' };
  }

  try {
    const { error } = await resend.contacts.create({
      email: trimmed,
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    });

    if (error) {
      if (error.message?.toLowerCase().includes('already exists')) {
        return { success: true }; 
      }
      console.error('Resend contacts error:', error);
      return { success: false, error: 'Er is iets misgegaan. Probeer het later opnieuw.' };
    }

    await resend.emails.send({
      from: 'IntrICT <hello@intrict.com>', // must match a verified Resend sender domain
      to: trimmed,
      subject: 'Welkom bij de IntrICT nieuwsbrief 👋',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1e293b;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Welkom!</h1>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 16px;">
            Je bent ingeschreven voor de IntrICT nieuwsbrief. Je ontvangt binnenkort tips over 
            webontwikkeling, design en digitale strategie.
          </p>
          <a href="https://intrict.com" 
             style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; 
                    text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Bezoek IntrICT →
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
            Uitschrijven? 
            <a href="{{unsubscribeUrl}}" style="color: #64748b;">Klik hier</a>.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return { success: false, error: 'Er is iets misgegaan. Probeer het later opnieuw.' };
  }
}