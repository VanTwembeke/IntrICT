import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import BerichtenPage from './BerichtenPage';

export default async function BerichtenServerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single<Profile>();
  if (!profile) redirect('/login');

  // Admins horen hier niet
  if (profile.role === 'admin') redirect('/inbox');

  return <BerichtenPage />;
}