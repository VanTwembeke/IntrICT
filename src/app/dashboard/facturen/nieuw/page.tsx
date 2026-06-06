import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ClientDossier, Invoice } from '@/lib/types';
import NieuweFactuurClient from './NieuweFactuurClient';

export default async function NieuweFactuurPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; dossier?: string; type?: string; van?: string }>;
}) {
  const { client: clientId, dossier: dossierId, type, van: linkedId } = await searchParams;
  // `client` is a profile_id; `dossier` is a dossier_id — both preselect in the form
  const preselected = dossierId ?? clientId;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/dashboard');

  const isCreditNote = type === 'credit_note';

  const [{ data: dossiers }, { data: packages }, linkedResult] = await Promise.all([
    supabase
      .from('client_dossiers')
      .select('*, profile:profiles(id, full_name, email, company, vat_number, address, postal_code, city), packages:dossier_packages(*, package:packages(id, name, price))')
      .order('updated_at', { ascending: false }),
    supabase
      .from('packages')
      .select('id, name, price, color')
      .eq('active', true)
      .order('sort_order'),
    linkedId
      ? supabase
          .from('invoices')
          .select('*, profile:profiles(id, full_name, email, company, vat_number, address, postal_code, city), items:invoice_items(*)')
          .eq('id', linkedId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <NieuweFactuurClient
        dossiers={(dossiers ?? []) as ClientDossier[]}
        availablePackages={packages ?? []}
        preselectedClientId={preselected}
        isCreditNote={isCreditNote}
        linkedInvoice={(linkedResult.data ?? null) as Invoice | null}
      />
    </div>
  );
}
