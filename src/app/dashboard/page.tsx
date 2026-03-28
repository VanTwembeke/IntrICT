import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Mail, Users, User, ArrowUpRight, Calendar, LayoutDashboard, Shield } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('id', user.id).maybeSingle<Profile>();
  if (error || !profile) redirect('/login');

  const isAdmin = profile.role === 'admin';
  const userCount = isAdmin
    ? (await supabase.from('profiles').select('id', { count: 'exact', head: true })).count ?? 0
    : 0;

  const dateString = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const cards = [
    {
      label: 'Gebruikers',
      value: String(userCount),
      sub: 'Geregistreerde accounts',
      icon: Users,
      href: '/dashboard/users',
      accent: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-900/40',
      show: isAdmin,
    },
    {
      label: 'Inbox',
      value: 'Berichten',
      sub: 'Bekijk ontvangen mail',
      icon: Mail,
      href: '/dashboard/inbox',
      accent: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-900/40',
      show: true,
    },
    {
      label: 'Mijn profiel',
      value: profile.full_name?.split(' ')[0] ?? 'Profiel',
      sub: 'Beheer je gegevens',
      icon: User,
      href: '/dashboard/profile',
      accent: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-900/40',
      show: true,
    },
  ].filter((c) => c.show);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Subtle dot-grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* ── Hero ── */}
      <section className="relative px-4 pt-24 pb-16 mx-auto overflow-hidden sm:px-6 lg:px-8 max-w-7xl">
        {/* Glow blob */}
        <div className="absolute rounded-full pointer-events-none -top-40 -left-40 w-96 h-96 bg-blue-600/10 blur-3xl" />
        <div className="absolute rounded-full pointer-events-none -top-20 right-20 w-72 h-72 bg-purple-600/8 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {isAdmin ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1 rounded-full">
                  <Shield size={10} /> Administrator
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
                  <LayoutDashboard size={10} /> Dashboard
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Welkom terug,{' '}
              <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                {profile.full_name?.split(' ')[0] ?? 'gebruiker'}
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">{profile.email}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <Calendar size={14} className="text-slate-600" />
            <span className="capitalize">{dateString}</span>
          </div>
        </div>
      </section>

      {/* ── Cards ── */}
      <section className="relative px-4 pb-16 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className={`grid grid-cols-1 gap-5 ${cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 max-w-xl'}`}>
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-6 hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Card glow on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br ${card.accent} blur-2xl`} style={{ opacity: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.04')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              />

              <div className="flex items-start justify-between mb-6">
                <div className={`p-2.5 rounded-xl bg-linear-to-br ${card.accent} shadow-lg ${card.glow}`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <ArrowUpRight size={16} className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-600">{card.sub}</p>
            </Link>
          ))}
        </div>

        {/* ── Admin banner ── */}
        {isAdmin && (
          <div className="flex flex-col gap-4 p-6 mt-6 border rounded-2xl border-white/8 bg-linear-to-r from-blue-500/8 to-purple-500/8 md:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">Admin toegang</p>
              <p className="font-semibold text-white">Je hebt volledige beheerrechten</p>
              <p className="mt-1 text-sm text-slate-500">Beheer gebruikers, stuur berichten en bekijk alle inbox meldingen.</p>
            </div>
            <Link
              href="/dashboard/users"
              className="shrink-0 flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Users size={15} /> Gebruikers beheren
            </Link>
          </div>
        )}

        {/* ── Non-admin: contact strip ── */}
        {!isAdmin && (
          <div className="flex flex-col gap-4 p-6 mt-6 border rounded-2xl border-white/8 bg-white/2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              Vragen of hulp nodig?
            </p>
            <a href="mailto:info@intrict.com"
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors flex items-center gap-1.5">
              <Mail size={14} /> info@intrict.com
            </a>
          </div>
        )}
      </section>
    </div>
  );
}