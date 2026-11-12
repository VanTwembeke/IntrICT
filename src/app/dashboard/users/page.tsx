import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UsersTable from './UsersTable';
import UsersLoadError from './UsersLoadError';
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

  let users: Profile[] | null = null;
  try {
    const result = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<Profile[]>();
    if (!result.error) users = result.data;
  } catch {
    // A rejected provider request is unavailable, not a successful empty list.
    users = null;
  }

  if (!Array.isArray(users) || !users.every((entry) =>
      entry && typeof entry.id === 'string' && typeof entry.email === 'string' &&
      typeof entry.created_at === 'string' && ['admin', 'user', 'klant'].includes(entry.role) &&
      (entry.customer_number == null || (typeof entry.customer_number === 'number' && Number.isFinite(entry.customer_number))) &&
      [entry.full_name, entry.company, entry.phone, entry.vat_number, entry.address,
        entry.postal_code, entry.city, entry.country, entry.profile_picture_url,
        entry.public_username].every(value => value == null || typeof value === 'string')
  )) return <UsersLoadError />;
  return <UsersTable users={users} currentUserId={user.id} />;
}
