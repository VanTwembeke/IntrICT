import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import FactuurDetail from './FactuurDetail';

export default async function FactuurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/dashboard');

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      profile:profiles(full_name, email, company, vat_number, address, postal_code, city, phone),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single();

  if (!invoice) notFound();

  return (
    <div className="p-6 lg:p-8">
      <FactuurDetail invoice={invoice as Invoice} />
    </div>
  );
}
