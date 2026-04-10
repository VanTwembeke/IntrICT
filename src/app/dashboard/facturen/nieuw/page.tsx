import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ClientDossier } from '@/lib/types';
import NieuweFactuurClient from './NieuweFactuurClient';

export default async function NieuweFactuurPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/dashboard');

  const [{ data: dossiers }, { data: packages }] = await Promise.all([
    supabase
      .from('client_dossiers')
      .select('*, profile:profiles(id, full_name, email, company, vat_number, address, postal_code, city), packages:dossier_packages(*, package:packages(id, name, price))')
      .order('updated_at', { ascending: false }),
    supabase
      .from('packages')
      .select('id, name, price, color')
      .eq('active', true)
      .order('sort_order'),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <NieuweFactuurClient
        dossiers={(dossiers ?? []) as ClientDossier[]}
        availablePackages={packages ?? []}
        preselectedClientId={clientId}
      />
    </div>
  );
}
