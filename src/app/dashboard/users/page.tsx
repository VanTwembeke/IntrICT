import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UsersTable from './UsersTable';
import type { Profile } from '@/lib/types';

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Profile[]>();

  return <UsersTable users={users ?? []} currentUserId={user.id} />;
}