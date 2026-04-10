export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/lib/invoice-pdf';
import type { Invoice } from '@/lib/types';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang.' }, { status: 403 });
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city, phone),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: 'Factuur niet gevonden.' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoicePDF, { invoice: invoice as Invoice }) as any;
  const buffer = await renderToBuffer(element);
  const uint8  = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="factuur-${invoice.invoice_number}.pdf"`,
      'Content-Length':      String(uint8.byteLength),
    },
  });
}
