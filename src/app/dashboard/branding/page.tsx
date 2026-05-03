import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BrandingClient from './BrandingClient';

export const metadata = { title: 'Brandgids — IntrICT Dashboard' };

export default async function BrandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="p-6 lg:p-8">
      <BrandingClient />
    </div>
  );
}
