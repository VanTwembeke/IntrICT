export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  // Verify caller is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json() as {
    email: string;
    password: string;
    full_name?: string;
    company?: string;
    phone?: string;
    vat_number?: string;
    address?: string;
    postal_code?: string;
    city?: string;
  };

  if (!body.email?.includes('@'))
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
  if (!body.password || body.password.length < 8)
    return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn.' }, { status: 400 });

  // Check for existing profile
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('email', body.email).maybeSingle();
  if (existing)
    return NextResponse.json({ error: 'Er bestaat al een account met dit e-mailadres.' }, { status: 409 });

  const admin = createAdminClient();

  // Create the auth user with a password — email_confirm: true activates immediately, no verification email sent
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      full_name:  body.full_name  ?? null,
      company:    body.company    ?? null,
      phone:      body.phone      ?? null,
    },
  });

  if (createErr || !created?.user)
    return NextResponse.json({ error: createErr?.message ?? 'Aanmaken mislukt.' }, { status: 500 });

  const newUserId = created.user.id;

  // Upsert the profile row
  await admin.from('profiles').upsert({
    id:          newUserId,
    email:       body.email,
    full_name:   body.full_name   ?? null,
    company:     body.company     ?? null,
    phone:       body.phone       ?? null,
    vat_number:  body.vat_number  ?? null,
    address:     body.address     ?? null,
    postal_code: body.postal_code ?? null,
    city:        body.city        ?? null,
    role:        'user',
  }, { onConflict: 'id' });

  // Activity log (best-effort)
  try {
    const { data: dossier } = await admin
      .from('client_dossiers').select('id').eq('profile_id', newUserId).maybeSingle();
    await admin.from('activity_logs').insert({
      profile_id: newUserId,
      dossier_id: dossier?.id ?? null,
      type:       'message_sent',
      title:      `Account aangemaakt: ${body.email}`,
      metadata:   { created_by: user.id },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, user_id: newUserId });
}
