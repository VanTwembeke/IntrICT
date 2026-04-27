import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Contract } from '@/lib/types';
import MijnContractenClient from './MijnContractenClient';

export default async function MijnContractenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') redirect('/dashboard/contracten');

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <MijnContractenClient contracts={(contracts ?? []) as Contract[]} />
    </div>
  );
}
