import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/newsletter-token';

export async function POST(request: Request) {
  const { email, token } = await request.json() as { email: string; token?: string };

  if (!email || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
  }

  // Token vereist — beschermt tegen automatisch uitschrijven van willekeurige adressen
  if (!token || !verifyUnsubscribeToken(email.trim(), token)) {
    return NextResponse.json({ error: 'Ongeldige of verlopen uitschrijflink.' }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.trim().toLowerCase(),
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (error) {
      return NextResponse.json({ error: 'Uitschrijven mislukt. Probeer opnieuw.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Er is iets misgegaan.' }, { status: 500 });
  }
}
