import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { supabase: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, error: null };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { data, error: dbError } = await supabase!
      .from('packages')
      .update({
        name: body.name,
        price: Number(body.price),
        description: body.description,
        features: body.features,
        color: body.color,
        highlight: Boolean(body.highlight),
        active: Boolean(body.active),
        sort_order: Number(body.sort_order ?? 0),
      })
      .eq('id', id)
      .select()
      .single();

    if (dbError) throw dbError;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  try {
    const { error: dbError } = await supabase!
      .from('packages')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
