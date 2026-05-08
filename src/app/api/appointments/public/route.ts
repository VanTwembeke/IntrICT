// Public appointment booking — no auth required (contact page)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMail } from '@/lib/mailer';

export async function POST(request: Request) {
  const body: {
    guest_name: string;
    guest_email: string;
    appointment_type_id: string;
    starts_at: string;
    notes?: string;
  } = await request.json();

  const { guest_name, guest_email, appointment_type_id, starts_at, notes } = body;

  // ── Input validation ────────────────────────────────────────────────────────
  if (!guest_name?.trim() || guest_name.trim().length < 2) {
    return NextResponse.json({ error: 'Naam is verplicht (min. 2 tekens).' }, { status: 400 });
  }
  if (!guest_email?.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(guest_email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
  }
  if (!appointment_type_id || !starts_at) {
    return NextResponse.json({ error: 'Afspraaktype en starttijd zijn verplicht.' }, { status: 400 });
  }

  const startDate = new Date(starts_at);
  if (isNaN(startDate.getTime()) || startDate < new Date()) {
    return NextResponse.json({ error: 'Ongeldige of verleden datum.' }, { status: 400 });
  }

  const supabase = await createClient();

  // ── Load appointment type ───────────────────────────────────────────────────
  const { data: apptType, error: typeErr } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('id', appointment_type_id)
    .eq('active', true)
    .single();

  if (typeErr || !apptType) {
    return NextResponse.json({ error: 'Onbekend afspraaktype.' }, { status: 400 });
  }

  // Public bookings can only use non-package types
  if (apptType.requires_package) {
    return NextResponse.json(
      { error: 'Dit afspraaktype vereist een actief pakket. Registreer je account om in te plannen.' },
      { status: 403 }
    );
  }

  // ── max_per_user check for guests (by email) ────────────────────────────────
  if (apptType.max_per_user !== null) {
    const { count } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('appointment_type_id', appointment_type_id)
      .eq('guest_email', guest_email.toLowerCase().trim())
      .neq('status', 'cancelled');

    if ((count ?? 0) >= apptType.max_per_user) {
      return NextResponse.json(
        { error: `Je hebt het maximum aantal "${apptType.name}" sessies al geboekt met dit e-mailadres.` },
        { status: 403 }
      );
    }
  }

  // ── Insert appointment ──────────────────────────────────────────────────────
  const endsAt = new Date(startDate.getTime() + apptType.duration_minutes * 60_000);

  // Use the service-role client to bypass RLS — all validation is done above.
  const adminClient = createAdminClient();
  const { data: appointment, error: insertErr } = await adminClient
    .from('appointments')
    .insert({
      user_id:             null,
      guest_name:          guest_name.trim(),
      guest_email:         guest_email.toLowerCase().trim(),
      appointment_type_id: apptType.id,
      type_name:           apptType.name,
      duration_minutes:    apptType.duration_minutes,
      starts_at:           startDate.toISOString(),
      ends_at:             endsAt.toISOString(),
      notes:               notes?.trim() || null,
      color:               apptType.color,
      status:              'pending',
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // ── Confirmation emails ─────────────────────────────────────────────────────
  const dateLabel = startDate.toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = startDate.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const endLabel  = endsAt.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

  try {
    await Promise.all([
      // Bevestiging aan de bezoeker
      sendMail({
        to: guest_email.trim(),
        subject: `Afspraakbevestiging – ${apptType.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <h2 style="color:#2563eb">Bedankt voor je aanvraag, ${guest_name.trim()}!</h2>
            <p>Je afspraakverzoek is ontvangen. We bevestigen dit zo snel mogelijk.</p>
            <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
              <p style="margin:4px 0"><strong>Type:</strong> ${apptType.name}</p>
              <p style="margin:4px 0"><strong>Datum:</strong> ${dateLabel}</p>
              <p style="margin:4px 0"><strong>Tijdstip:</strong> ${timeLabel} – ${endLabel}</p>
              ${notes ? `<p style="margin:4px 0"><strong>Jouw notitie:</strong> ${notes}</p>` : ''}
            </div>
            <p>Heb je vragen? Stuur ons een bericht via <a href="mailto:info@intrict.com">info@intrict.com</a>.</p>
            <p style="color:#94a3b8;font-size:13px">— Het IntrICT team</p>
          </div>
        `,
      }),
      // Notificatie aan admin
      sendMail({
        to: 'info@intrict.com',
        subject: `Nieuwe afspraak via contactpagina – ${guest_name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
            <h2 style="color:#2563eb">Nieuwe afspraak via de contactpagina</h2>
            <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
              <p style="margin:4px 0"><strong>Naam:</strong> ${guest_name.trim()}</p>
              <p style="margin:4px 0"><strong>E-mail:</strong> <a href="mailto:${guest_email}">${guest_email}</a></p>
              <p style="margin:4px 0"><strong>Type:</strong> ${apptType.name}</p>
              <p style="margin:4px 0"><strong>Datum:</strong> ${dateLabel}</p>
              <p style="margin:4px 0"><strong>Tijdstip:</strong> ${timeLabel} – ${endLabel}</p>
              ${notes ? `<p style="margin:4px 0"><strong>Notitie:</strong> ${notes}</p>` : ''}
            </div>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com'}/dashboard/kalender" style="background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none">Bekijk in dashboard &rarr;</a></p>
          </div>
        `,
      }),
    ]);
  } catch {
    // E-mails zijn best-effort; afspraak is al opgeslagen
  }

  return NextResponse.json(appointment, { status: 201 });
}
