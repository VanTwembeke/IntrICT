import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { TimeLog } from '@/lib/types';
import TijdregistratieClient from './TijdregistratieClient';

export default async function TijdregistratiePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/kalender');

  let logs: TimeLog[] = [];
  let users: { id: string; full_name: string | null; email: string }[] = [];

  try {
    const { data } = await supabase
      .from('time_logs')
      .select('*, profile:profiles(full_name, email)')
      .order('logged_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);
    logs = (data ?? []) as TimeLog[];
  } catch { /* */ }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');
    users = (data ?? []) as typeof users;
  } catch { /* */ }

  return (
    <div className="p-6 lg:p-8">
      <TijdregistratieClient initialLogs={logs} users={users} />
    </div>
  );
}
