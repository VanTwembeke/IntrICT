import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, Mail, Users, User } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  const isAdmin = profile.role === 'admin';

  const adminStats = isAdmin
    ? await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
    : null;

  const userCount = adminStats?.[0]?.count ?? 0;

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welkom terug, {profile.full_name?.split(' ')[0] ?? 'gebruiker'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('nl-BE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Geregistreerde gebruikers',
              value: userCount,
              icon: <Users size={22} className="text-blue-500" />,
              href: '/dashboard/users',
              bg: 'from-blue-50 to-blue-100',
            },
            {
              label: 'Inbox',
              value: 'Bekijk mails',
              icon: <Mail size={22} className="text-purple-500" />,
              href: '/dashboard/inbox',
              bg: 'from-purple-50 to-purple-100',
            },
            {
              label: 'Mijn profiel',
              value: 'Bewerk gegevens',
              icon: <User size={22} className="text-green-500" />,
              href: '/dashboard/profile',
              bg: 'from-green-50 to-green-100',
            },
          ].map((card) => (
            
              key={card.label}
              href={card.href}
              className={`bg-linear-to-br ${card.bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">{card.icon}</div>
              </div>
              <p className="text-sm text-slate-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </a>
          ))}
        </div>
      ) : (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <User size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{profile.full_name ?? 'Gebruiker'}</p>
                <p className="text-sm text-slate-500">{profile.email}</p>
              </div>
            </div>
            
              href="/dashboard/profile"
              className="block w-full text-center py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Mijn profiel bewerken
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
