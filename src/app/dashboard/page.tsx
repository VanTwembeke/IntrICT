import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, User, ArrowRight, Calendar } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
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

  if (error || !profile) redirect('/login');

  const isAdmin = profile.role === 'admin';

  const userCount = isAdmin
    ? (await supabase.from('profiles').select('id', { count: 'exact', head: true })).count ?? 0
    : 0;

  const cards = [
    {
      label: 'Geregistreerde gebruikers',
      value: String(userCount),
      description: 'Totaal aantal accounts',
      icon: <Users size={22} className="text-blue-500" />,
      href: '/dashboard/users',
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-100',
    },
    {
      label: 'Mijn profiel',
      value: 'Profiel',
      description: 'Beheer je gegevens',
      icon: <User size={22} className="text-green-500" />,
      href: '/dashboard/profile',
      bg: 'from-green-50 to-green-100',
      border: 'border-green-100',
    },
  ];

  const dateString = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <DashboardSidebar profile={profile} />

      <main>
        {/* Hero banner */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
          </div>
          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium tracking-widest text-blue-400 uppercase">
                  {isAdmin ? 'Administrator' : 'Gebruiker'}
                </p>
                <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                  Welkom terug,{' '}
                  <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                    {profile.full_name?.split(' ')[0] ?? 'gebruiker'}
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={16} />
                <span className="text-sm capitalize">{dateString}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {isAdmin ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Dashboard overzicht</h2>
                  <p className="mt-1 text-slate-500">Beheer je platform via onderstaande modules</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((card) => (
                    <Link
                      key={card.label}
                      href={card.href}
                      className={`group block bg-linear-to-br ${card.bg} rounded-2xl p-6 border ${card.border} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-white shadow-sm rounded-xl">
                          {card.icon}
                        </div>
                        <ArrowRight
                          size={18}
                          className="transition-all duration-200 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1"
                        />
                      </div>
                      <p className="mb-1 text-xs font-medium tracking-wide uppercase text-slate-400">
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                    </Link>
                  ))}
                </div>

                <div className="p-6 mt-10 border border-blue-100 bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Ingelogd als administrator</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Je hebt volledige toegang tot alle modules en gebruikersbeheer.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/users"
                      className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white transition-all duration-300 shadow-md bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-lg shrink-0"
                    >
                      <Users size={16} />
                      Gebruikers beheren
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Mijn account</h2>
                  <p className="mt-1 text-slate-500">Bekijk en beheer je persoonlijke gegevens</p>
                </div>

                <div className="max-w-lg">
                  <div className="p-8 bg-white border shadow-sm border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                        {(profile.full_name ?? profile.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {profile.full_name ?? 'Gebruiker'}
                        </p>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                        <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                          Gebruiker
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all duration-300 shadow-md bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-lg"
                      >
                        <User size={16} />
                        Mijn profiel bewerken
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 mt-4 border border-blue-100 bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl">
                    <p className="text-sm leading-relaxed text-slate-600">
                      Heb je vragen of hulp nodig? Neem contact op via{' '}
                      <a href="mailto:info@intrict.com" className="font-semibold text-blue-600 hover:underline">
                        info@intrict.com
                      </a>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}