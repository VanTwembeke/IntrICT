export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  // 1. Verify caller is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  // 2. Parse body
  const body = await request.json();
  const { email, full_name, company, phone, vat_number, address, postal_code, city } = body as {
    email: string;
    full_name?: string;
    company?: string;
    phone?: string;
    vat_number?: string;
    address?: string;
    postal_code?: string;
    city?: string;
  };

  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 });
  }

  // 3. Check if user already exists
  const admin = createAdminClient();
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('email', email).maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Er bestaat al een account met dit e-mailadres.' }, { status: 409 });
  }

  // 4. Invite via Supabase auth (sends magic-link / set-password email)
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://intrict.com'}/dashboard`;
  const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name:   full_name   ?? null,
      company:     company     ?? null,
      phone:       phone       ?? null,
      vat_number:  vat_number  ?? null,
      address:     address     ?? null,
      postal_code: postal_code ?? null,
      city:        city        ?? null,
    },
  });

  if (inviteErr || !invite?.user) {
    return NextResponse.json({ error: inviteErr?.message ?? 'Uitnodiging mislukt.' }, { status: 500 });
  }

  const newUserId = invite.user.id;

  // 5. Upsert the profile row (trigger may already create it, but we fill in the extra fields)
  await admin.from('profiles').upsert({
    id:          newUserId,
    email,
    full_name:   full_name   ?? null,
    company:     company     ?? null,
    phone:       phone       ?? null,
    vat_number:  vat_number  ?? null,
    address:     address     ?? null,
    postal_code: postal_code ?? null,
    city:        city        ?? null,
    role:        'user',
  }, { onConflict: 'id' });

  // 6. Log activity (best-effort — client_dossiers trigger auto-creates a dossier)
  try {
    const { data: dossier } = await admin
      .from('client_dossiers').select('id').eq('profile_id', newUserId).maybeSingle();

    await admin.from('activity_logs').insert({
      profile_id: newUserId,
      dossier_id: dossier?.id ?? null,
      type:       'message_sent',
      title:      `Uitnodiging verstuurd naar ${email}`,
      metadata:   { invited_by: user.id },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, user_id: newUserId });
}
