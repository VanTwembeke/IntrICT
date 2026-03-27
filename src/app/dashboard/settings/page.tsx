import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Settings, Bell, Shield, Palette, Package, Clock } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import type { Profile } from '@/lib/types';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (!profile) redirect('/login');

  const upcomingSections = [
    {
      icon: <Bell size={20} className="text-blue-500" />,
      bg: 'bg-blue-50',
      title: 'Notificaties',
      description: 'Beheer je e-mail en meldingsvoorkeuren.',
    },
    {
      icon: <Shield size={20} className="text-purple-500" />,
      bg: 'bg-purple-50',
      title: 'Beveiliging',
      description: 'Wachtwoord wijzigen en twee-factor authenticatie.',
    },
    {
      icon: <Palette size={20} className="text-green-500" />,
      bg: 'bg-green-50',
      title: 'Weergave',
      description: 'Taal- en weergaveinstellingen aanpassen.',
    },
    ...(profile.role === 'admin'
      ? [
          {
            icon: <Package size={20} className="text-orange-500" />,
            bg: 'bg-orange-50',
            title: 'Integraties',
            description: 'Koppelingen met Resend, Supabase en andere diensten.',
          },
        ]
      : []),
  ];

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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <Settings size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium tracking-widest text-blue-400 uppercase">
                  {profile.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                </p>
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  Instellingen
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

            {/* Current account — live and functional */}
            <div className="mb-10">
              <h2 className="mb-4 text-xs font-semibold tracking-widest uppercase text-slate-400">
                Huidig account
              </h2>
              <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-2xl">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="flex items-center flex-1 gap-4">
                    <div className="flex items-center justify-center text-xl font-bold text-white rounded-full w-14 h-14 bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                      {(profile.full_name ?? profile.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-800">
                        {profile.full_name ?? 'Gebruiker'}
                      </p>
                      <p className="text-sm text-slate-500">{profile.email}</p>
                      <span
                        className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          profile.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {profile.role === 'admin' ? 'Administrator' : 'Gebruiker'}
                      </span>
                    </div>
                  </div>
                  <a
                    href="/dashboard/profile"
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                  >
                    Profiel bewerken
                  </a>
                </div>
              </div>
            </div>

            {/* Upcoming sections */}
            <div>
              <h2 className="mb-4 text-xs font-semibold tracking-widest uppercase text-slate-400">
                Binnenkort beschikbaar
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {upcomingSections.map((section) => (
                  <div
                    key={section.title}
                    className="flex items-start gap-4 p-5 bg-white border shadow-sm border-slate-100 rounded-2xl"
                  >
                    <div className={`p-2.5 rounded-xl ${section.bg} shrink-0`}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-700">{section.title}</p>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-full">
                          <Clock size={10} />
                          Binnenkort
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{section.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}