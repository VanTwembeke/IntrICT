import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? '';

export async function POST(request: Request) {
  const { email } = await request.json() as { email: string };

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
  }

  if (!AUDIENCE_ID) {
    return NextResponse.json({ error: 'Service niet beschikbaar.' }, { status: 500 });
  }

  try {
    const { error } = await resend.contacts.create({
      email: email.trim().toLowerCase(),
      audienceId: AUDIENCE_ID,
      unsubscribed: true,
    });

    // "already exists" is fine — we updated the unsubscribed flag
    if (error && !error.message?.toLowerCase().includes('already exists')) {
      return NextResponse.json({ error: 'Uitschrijven mislukt. Probeer opnieuw.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Er is iets misgegaan.' }, { status: 500 });
  }
}
