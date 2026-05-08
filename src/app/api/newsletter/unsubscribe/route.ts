import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { email } = await request.json() as { email: string };

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
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
