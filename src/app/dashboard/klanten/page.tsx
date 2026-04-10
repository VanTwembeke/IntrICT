import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ClientDossier } from '@/lib/types';
import KlantenClient from './KlantenClient';

export default async function KlantenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data } = await supabase
    .from('client_dossiers')
    .select('*, profile:profiles(full_name, email, phone, company, customer_number), packages:dossier_packages(*, package:packages(id,name,price,color))')
    .order('updated_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <KlantenClient initialDossiers={(data ?? []) as ClientDossier[]} />
    </div>
  );
}
