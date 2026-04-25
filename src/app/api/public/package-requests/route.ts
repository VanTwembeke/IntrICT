import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({
  package_name:  z.string().min(1).max(100),
  package_price: z.number().nonnegative(),
  guest_name:    z.string().min(1).max(100),
  guest_email:   z.string().email(),
  guest_phone:   z.string().max(30).optional().nullable(),
  guest_company: z.string().max(100).optional().nullable(),
  notes:         z.string().max(1000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('package_requests')
      .insert({
        user_id:       null,
        package_name:  parsed.data.package_name,
        package_price: parsed.data.package_price,
        guest_name:    parsed.data.guest_name,
        guest_email:   parsed.data.guest_email,
        guest_phone:   parsed.data.guest_phone ?? null,
        guest_company: parsed.data.guest_company ?? null,
        notes:         parsed.data.notes ?? null,
        status:        'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-create a guest lead dossier for pipeline tracking
    await supabase.from('client_dossiers').insert({
      profile_id:    null,
      status:        'lead',
      guest_name:    parsed.data.guest_name,
      guest_email:   parsed.data.guest_email,
      guest_phone:   parsed.data.guest_phone ?? null,
      guest_company: parsed.data.guest_company ?? null,
      notes:         `Pakketaanvraag: ${parsed.data.package_name} (€${parsed.data.package_price})${parsed.data.notes ? `\n\n${parsed.data.notes}` : ''}`,
      source:        'package_request',
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[public/package-requests]', err);
    return NextResponse.json({ error: 'Er liep iets mis. Probeer het later opnieuw.' }, { status: 500 });
  }
}
