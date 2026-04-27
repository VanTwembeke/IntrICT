import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ClientDossier } from '@/lib/types';
import NieuwContractClient from './NieuwContractClient';

export default async function NieuwContractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: dossiers } = await supabase
    .from('client_dossiers')
    .select('*, profile:profiles(id, full_name, email, phone, company, customer_number, vat_number, address, postal_code, city)')
    .order('updated_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <NieuwContractClient dossiers={(dossiers ?? []) as ClientDossier[]} />
    </div>
  );
}
