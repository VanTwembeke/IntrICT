import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import EmailPage from './EmailPage';

export default async function EmailServerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  // Only admins can access email functionality
  if (profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get all profiles for recipient selection
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, company')
    .neq('id', user.id)
    .order('full_name', { ascending: true });

  return (
    <EmailPage
      profile={profile}
      allProfiles={allProfiles || []}
    />
  );
}