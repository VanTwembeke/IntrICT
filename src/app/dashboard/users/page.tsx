import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, Shield, User } from 'lucide-react';
import UsersTable from './UsersTable';
import type { Profile } from '@/lib/types';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).returns<Profile[]>();

  const total  = users?.length ?? 0;
  const admins = users?.filter((u) => u.role === 'admin').length ?? 0;
  const regular = total - admins;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Hero */}
      <section className="relative px-4 pt-24 pb-8 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 shadow-xl rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-blue-900/40">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">Beheer</p>
            <h1 className="text-3xl font-bold text-white">Gebruikers</h1>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Totaal', value: total, icon: Users, color: 'text-white', bg: 'from-slate-700/60 to-slate-800/60', border: 'border-white/10' },
            { label: 'Admins', value: admins, icon: Shield, color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20' },
            { label: 'Klanten', value: regular, icon: User, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-linear-to-br ${s.bg} p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} className={s.color} />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative px-4 pb-20 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <UsersTable users={users ?? []} currentUserId={user.id} />
      </div>
    </div>
  );
}