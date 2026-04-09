import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, User, Mail, Package, ArrowRight, Calendar, Sparkles, Send } from 'lucide-react';
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

  const dateString = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {isAdmin ? 'Administrator' : 'Gebruiker'}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Welkom terug,{' '}
            <span className="text-blue-600">
              {profile.full_name?.split(' ')[0] ?? 'gebruiker'}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Calendar size={15} />
          <span className="capitalize">{dateString}</span>
        </div>
      </div>

      {/* Admin stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <Link
            href="/dashboard/users"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Users size={20} className="text-blue-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{userCount}</p>
            <p className="text-sm font-medium text-slate-500">Geregistreerde gebruikers</p>
          </Link>

          <Link
            href="/dashboard/messages"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-purple-50 rounded-xl">
                <Mail size={20} className="text-purple-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">Berichten</p>
            <p className="text-sm font-medium text-slate-500">Gesprekken & communicatie</p>
          </Link>

          <Link
            href="/dashboard/email"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-green-50 rounded-xl">
                <Send size={20} className="text-green-600" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">E-mail</p>
            <p className="text-sm font-medium text-slate-500">Verstuur berichten naar gebruikers</p>
          </Link>
        </div>
      )}

      {/* Packages teaser + profile quick link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-linear-to-br from-blue-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-blue-200" />
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                Pakketten
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Bekijk onze dienstenpakketten</h2>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed max-w-md">
              Van een eenvoudige brochuresite tot een volledig uitgeruste webshop — we hebben
              een pakket voor elk budget en project.
            </p>
            <Link
              href="/dashboard/pakketten"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm"
            >
              <Package size={16} />
              Bekijk pakketten
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="p-2.5 bg-slate-50 rounded-xl w-fit mb-4">
            <User size={20} className="text-slate-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Jouw profiel</h3>
          <p className="text-sm text-slate-500 flex-1 mb-4">
            Beheer je contactgegevens, bedrijfsinformatie en openbare profielpagina.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Profiel bewerken <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Contact callout */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Heb je vragen of hulp nodig?</h3>
            <p className="text-sm text-slate-500">
              Neem contact op via{' '}
              <a
                href="mailto:info@intrict.com"
                className="font-semibold text-blue-600 hover:underline"
              >
                info@intrict.com
              </a>{' '}
              — we helpen je graag verder.
            </p>
          </div>
          <a
            href="mailto:info@intrict.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shrink-0"
          >
            <Mail size={16} />
            Contact opnemen
          </a>
        </div>
      </div>
    </div>
  );
}
