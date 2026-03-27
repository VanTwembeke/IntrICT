import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Mail, Users, User } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle<Profile>();

if (error) {
  console.error('PROFILE ERROR:', error);
  redirect('/login');
}

if (!profile) {
  redirect('/login');
}

  const isAdmin = profile.role === 'admin';

  const adminStats = isAdmin
    ? await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
    : null;

  const userCount = adminStats?.[0]?.count ?? 0;

  const cards = [
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
  ];

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Welkom terug, {profile.full_name?.split(' ')[0] ?? 'gebruiker'} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          {new Date().toLocaleDateString('nl-BE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Admin View */}
      {isAdmin ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`block bg-linear-to-br ${card.bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white shadow-sm rounded-xl">
                  {card.icon}
                </div>
              </div>
              <p className="mb-1 text-sm text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">
                {card.value}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        /* User View */
        <div className="max-w-lg">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <User size={22} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {profile.full_name ?? 'Gebruiker'}
                </p>
                <p className="text-sm text-slate-500">
                  {profile.email}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              className="block w-full py-3 font-semibold text-center text-white transition-all duration-200 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600"
            >
              Mijn profiel bewerken
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
