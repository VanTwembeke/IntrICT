import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { WorkingHour } from '@/lib/types';
import WerktijdenClient from './WerktijdenClient';

export default async function WerktijdenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/kalender');

  let workingHours: WorkingHour[] = [];
  try {
    const { data } = await supabase.from('working_hours').select('*').order('day_of_week');
    workingHours = (data ?? []) as WorkingHour[];
  } catch { /* table not yet created */ }

  return (
    <div className="p-6 lg:p-8">
      <WerktijdenClient initialHours={workingHours} />
    </div>
  );
}
