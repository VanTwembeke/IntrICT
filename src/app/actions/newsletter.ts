'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendMail } from '@/lib/mailer';
import { generateUnsubscribeToken } from '@/lib/newsletter-token';

export type NewsletterState = {
  success: boolean;
  error?: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com';

export async function updateNewsletterSubscription(email: string, subscribe: boolean): Promise<NewsletterState> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          is_active: subscribe,
          ...(subscribe
            ? { subscribed_at: new Date().toISOString(), unsubscribed_at: null }
            : { unsubscribed_at: new Date().toISOString() }),
        },
        { onConflict: 'email' }
      );

    if (error) return { success: false, error: 'Kon nieuwsbrief voorkeur niet opslaan.' };
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: 'Voer een geldig e-mailadres in.' };
  }

  try {
    const admin = createAdminClient();

    // Upsert — al ingeschreven is geen fout
    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert(
        { email: trimmed, is_active: true, subscribed_at: new Date().toISOString(), unsubscribed_at: null },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Newsletter upsert error:', error);
      return { success: false, error: 'Er is iets misgegaan. Probeer het later opnieuw.' };
    }

    // Welkomstmail
    await sendMail({
      from: 'jonas@intrict.com',
      to: trimmed,
      subject: 'Welkom bij de IntrICT nieuwsbrief',
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
            Bezoek IntrICT &rarr;
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
            Uitschrijven?
            <a href="${SITE_URL}/uitschrijven?email=${encodeURIComponent(trimmed)}&token=${generateUnsubscribeToken(trimmed)}" style="color: #64748b;">Klik hier</a>.
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
