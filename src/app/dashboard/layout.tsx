import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar profile={profile} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
