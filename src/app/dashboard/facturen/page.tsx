import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import FacturenClient from './FacturenClient';

export default async function FacturenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/dashboard');

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, profile:profiles(full_name, email, company), items:invoice_items(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <FacturenClient initialInvoices={(invoices ?? []) as Invoice[]} />
    </div>
  );
}
