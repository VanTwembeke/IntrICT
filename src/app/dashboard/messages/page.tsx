import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import MessagesPage from './MessagesPage';

export default async function MessagesServerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  // Get all profiles for the recipient selector (excluding current user)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .neq('id', user.id)
    .order('full_name', { ascending: true });

  return (
    <MessagesPage
      profile={profile}
      allProfiles={allProfiles || []}
    />
  );
}