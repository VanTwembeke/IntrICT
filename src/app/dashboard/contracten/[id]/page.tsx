import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Contract, Invoice } from '@/lib/types';
import ContractDetail from './ContractDetail';

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*, profile:profiles(full_name, email, company, vat_number, address, postal_code, city)')
    .eq('id', id)
    .single();

  if (error || !contract) notFound();

  // Load invoices linked to this dossier that are related to the contract
  // (the recurring template + all generated copies)
  let linkedInvoices: Invoice[] = [];
  if (contract.dossier_id) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('dossier_id', contract.dossier_id)
      .order('issue_date', { ascending: false })
      .limit(24);
    linkedInvoices = (invoices ?? []) as Invoice[];
  } else if (contract.profile_id) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('profile_id', contract.profile_id)
      .order('issue_date', { ascending: false })
      .limit(24);
    linkedInvoices = (invoices ?? []) as Invoice[];
  }

  return (
    <div className="p-6 lg:p-8">
      <ContractDetail
        contract={contract as Contract}
        linkedInvoices={linkedInvoices}
      />
    </div>
  );
}
