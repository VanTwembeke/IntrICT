import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ClientDossier, ActivityLog, Invoice } from '@/lib/types';
import DossierClient from './DossierClient';

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') redirect('/dashboard');

  const { data: dossier } = await supabase
    .from('client_dossiers')
    .select('*, profile:profiles(full_name, email, phone, company, vat_number, address, postal_code, city, customer_number, created_at), packages:dossier_packages(*, package:packages(id, name, price, color, description))')
    .eq('id', id)
    .single();

  if (!dossier) notFound();

  const [{ data: activity }, { data: invoices }, { data: packages }] = await Promise.all([
    supabase.from('activity_logs').select('*, profile:profiles(full_name, email)').eq('dossier_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('invoices').select('*, items:invoice_items(*)').eq('dossier_id', id).order('created_at', { ascending: false }),
    supabase.from('packages').select('id, name, price, color').eq('active', true).order('sort_order'),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <DossierClient
        dossier={dossier as ClientDossier}
        activity={(activity ?? []) as ActivityLog[]}
        invoices={(invoices ?? []) as Invoice[]}
        availablePackages={packages ?? []}
      />
    </div>
  );
}
