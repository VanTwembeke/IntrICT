import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${rand}`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const query = supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city),
      items:invoice_items(*)
    `)
    .order('created_at', { ascending: false });

  if (status) query.eq('status', status);
  if (!isAdmin) query.eq('profile_id', user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });

  const body = await request.json();
  const {
    profile_id, dossier_id, due_date, notes,
    vat_rate = 21, is_recurring = false, recurring_interval = null,
    language = 'nl',
    items = [],
  } = body;

  if (!profile_id) return NextResponse.json({ error: 'profile_id is verplicht.' }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: 'Minstens één factuurlijn is verplicht.' }, { status: 400 });

  // Compute totals
  const subtotal = items.reduce((s: number, i: { quantity: number; unit_price: number }) =>
    s + i.quantity * i.unit_price, 0);
  const vat_amount = Math.round(subtotal * vat_rate) / 100;
  const total = subtotal + vat_amount;

  // Generate unique invoice number
  let invoice_number = generateInvoiceNumber();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('invoices').select('id').eq('invoice_number', invoice_number).maybeSingle();
    if (!existing) break;
    invoice_number = generateInvoiceNumber();
    attempts++;
  }

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      invoice_number,
      profile_id,
      dossier_id: dossier_id ?? null,
      due_date: due_date ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      subtotal, vat_rate, vat_amount, total,
      notes: notes ?? null,
      language,
      is_recurring, recurring_interval,
    })
    .select()
    .single();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // Insert items
  const itemRows = items.map((i: { description: string; quantity: number; unit_price: number; package_id?: string }) => ({
    invoice_id: invoice.id,
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total: Math.round(i.quantity * i.unit_price * 100) / 100,
    package_id: i.package_id ?? null,
  }));

  const { error: itemErr } = await supabase.from('invoice_items').insert(itemRows);
  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 });

  // Log activity
  await supabase.from('activity_logs').insert({
    profile_id,
    dossier_id: dossier_id ?? null,
    type: 'invoice_created',
    title: `Factuur ${invoice_number} aangemaakt — €${total.toFixed(2)}`,
    metadata: { invoice_id: invoice.id, invoice_number, total },
  });

  return NextResponse.json(invoice, { status: 201 });
}
