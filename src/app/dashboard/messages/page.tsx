// app/(dashboard)/messages/page.tsx
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

  let allProfiles: Array<{ id: string; full_name: string | null; email: string; role: string; company: string | null }> = [];

  if (profile.role === 'admin') {
    // Admins can message everyone
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, company')
      .neq('id', user.id)
      .order('full_name', { ascending: true });
    allProfiles = data || [];
  } else {
    // Regular users: admins + users in the same company
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, company')
      .neq('id', user.id)
      .or(`role.eq.admin,company.eq.${profile.company}`)
      .order('full_name', { ascending: true });
    allProfiles = data || [];
  }

  return (
    <MessagesPage
      profile={profile}
      allProfiles={allProfiles}
    />
  );
}