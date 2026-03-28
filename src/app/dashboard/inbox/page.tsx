import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import InboxPage from './InboxPage';

export default async function InboxServerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  let customers: Profile[] = [];
  if (profile.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })
      .returns<Profile[]>();
    customers = data ?? [];
  }

  return <InboxPage profile={profile} customers={customers} />;
}