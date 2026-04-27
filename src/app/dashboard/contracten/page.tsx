import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Contract } from '@/lib/types';
import ContractenClient from './ContractenClient';

export default async function ContractenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data } = await supabase
    .from('contracts')
    .select('*, profile:profiles(full_name, email, company)')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <ContractenClient initialContracts={(data ?? []) as Contract[]} />
    </div>
  );
}
