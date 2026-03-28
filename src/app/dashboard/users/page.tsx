import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users } from 'lucide-react';
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

  return (
    <div className="p-6 lg:p-10">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 shadow-lg rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 shadow-blue-200">
          <Users size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gebruikers</h1>
          <p className="text-slate-500 mt-0.5">Beheer alle geregistreerde gebruikers</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3">
        <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100">
          <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Totaal</p>
          <p className="text-3xl font-bold text-slate-800">{users?.length ?? 0}</p>
        </div>
        <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100">
          <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Admins</p>
          <p className="text-3xl font-bold text-purple-600">
            {users?.filter((u) => u.role === 'admin').length ?? 0}
          </p>
        </div>
        <div className="col-span-2 p-5 bg-white border shadow-sm rounded-2xl border-slate-100 sm:col-span-1">
          <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Gebruikers</p>
          <p className="text-3xl font-bold text-blue-600">
            {users?.filter((u) => u.role !== 'admin').length ?? 0}
          </p>
        </div>
      </div>

      <UsersTable users={users ?? []} currentUserId={user.id} />
    </div>
  );
}