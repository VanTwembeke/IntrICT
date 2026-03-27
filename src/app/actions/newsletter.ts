'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type NewsletterState = {
  success: boolean;
  error?: string;
};

export async function subscribeNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const emailEntry = formData.get('email');

  if (typeof emailEntry !== 'string' || !emailEntry.includes('@')) {
    return { success: false, error: 'Ongeldig e-mailadres.' };
  }

  try {
    await resend.contacts.create({
  email: emailEntry,
});

    return { success: true };
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error && error.message.includes('already exists')) {
      return { success: true };
    }

    return { success: false, error: 'Er ging iets mis. Probeer opnieuw.' };
  }
}