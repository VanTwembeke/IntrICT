import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Users, User, Mail, Package, ArrowRight, Calendar,
  Sparkles, ClipboardList, Clock, CheckCircle,
  MessageSquare, TrendingUp, CalendarCheck,
} from 'lucide-react';
import type { Profile, Appointment } from '@/lib/types';
import AdminOnly from '@/components/dashboard/AdminOnly';

// ─── Activity feed item ───────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'request' | 'message';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

function ActivityIcon({ type, status }: { type: string; status?: string }) {
  if (type === 'request') {
    if (status === 'accepted') return <CheckCircle size={15} className="text-green-500" />;
    if (status === 'rejected') return <XIcon />;
    return <Package size={15} className="text-blue-500" />;
  }
  return <MessageSquare size={15} className="text-purple-500" />;
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-slate-400">
      <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending:   'Nieuw',
  contacted: 'Gecontacteerd',
  accepted:  'Geaccepteerd',
  rejected:  'Afgewezen',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const dateString = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Admin stats ──────────────────────────────────────────────────────────────
  let userCount = 0;
  let pendingRequestCount = 0;
  let packageCount = 0;
  let pendingAppointmentCount = 0;
  let revenueAccepted = 0;
  let revenuePending = 0;
  let upcomingAppointments: Appointment[] = [];

  if (isAdmin) {
    userCount = (await supabase.from('profiles').select('id', { count: 'exact', head: true })).count ?? 0;

    try {
      pendingRequestCount =
        (await supabase.from('package_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')).count ?? 0;
      packageCount =
        (await supabase.from('packages').select('id', { count: 'exact', head: true }).eq('active', true)).count ?? 0;

      // Revenue: sum of accepted + pending package requests
      const { data: revenueRows } = await supabase
        .from('package_requests')
        .select('package_price, status')
        .in('status', ['accepted', 'pending']);
      if (revenueRows) {
        revenueAccepted = revenueRows.filter((r) => r.status === 'accepted').reduce((s, r) => s + (r.package_price ?? 0), 0);
        revenuePending  = revenueRows.filter((r) => r.status === 'pending').reduce((s, r) => s + (r.package_price ?? 0), 0);
      }
    } catch { /* tables not yet created */ }

    try {
      pendingAppointmentCount =
        (await supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending')).count ?? 0;

      const now = new Date().toISOString();
      const { data: upcoming } = await supabase
        .from('appointments')
        .select('*, profile:profiles(full_name, email)')
        .gte('starts_at', now)
        .in('status', ['pending', 'confirmed'])
        .order('starts_at', { ascending: true })
        .limit(5);
      upcomingAppointments = (upcoming ?? []) as Appointment[];
    } catch { /* appointments table not yet created */ }
  }

  // ── Activity feed (recent 8 items) ───────────────────────────────────────────
  const activity: ActivityItem[] = [];

  try {
    // Package requests: admin sees all, user sees own
    const reqQuery = supabase
      .from('package_requests')
      .select('id, package_name, package_price, status, created_at, profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: requests } = isAdmin
      ? await reqQuery
      : await reqQuery.eq('user_id', user.id);

    if (requests) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const r of requests as any[]) {
        activity.push({
          id: r.id,
          type: 'request',
          title: isAdmin
            ? `${r.profile?.full_name ?? r.profile?.email ?? 'Gebruiker'} — ${r.package_name}`
            : `Aanvraag ${r.package_name}`,
          subtitle: `€${r.package_price.toLocaleString('nl-BE')} · ${REQUEST_STATUS_LABELS[r.status] ?? r.status}`,
          time: r.created_at,
          status: r.status,
        });
      }
    }
  } catch { /* table not yet created */ }

  // Sort by time and take most recent 8
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivity = activity.slice(0, 8);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
    return d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });
  };

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

      {/* Admin stats grid */}
      {isAdmin && (
      <AdminOnly>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Link href="/dashboard/users" className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-xl"><Users size={18} className="text-blue-600" /></div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{userCount}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Gebruikers</p>
          </Link>

          <Link href="/dashboard/aanvragen" className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative">
            {pendingRequestCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center justify-center">
                {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 rounded-xl"><ClipboardList size={18} className="text-amber-600" /></div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingRequestCount}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Nieuwe aanvragen</p>
          </Link>

          <Link href="/dashboard/pakketten" className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-xl"><Package size={18} className="text-green-600" /></div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{packageCount}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Actieve pakketten</p>
          </Link>

          <Link href="/dashboard/kalender" className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative">
            {pendingAppointmentCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingAppointmentCount > 9 ? '9+' : pendingAppointmentCount}
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-rose-50 rounded-xl"><CalendarCheck size={18} className="text-rose-600" /></div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingAppointmentCount}</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Openstaande afspraken</p>
          </Link>

          <Link href="/dashboard/messages" className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-xl"><Mail size={18} className="text-purple-600" /></div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold text-slate-900">Berichten</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Gesprekken</p>
          </Link>
        </div>

        {/* Revenue snapshot + Upcoming appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Revenue snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp size={18} className="text-emerald-600" /></div>
              <h3 className="font-bold text-slate-900">Omzet overzicht</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Geaccepteerd</p>
                <p className="text-2xl font-bold text-emerald-700">
                  €{revenueAccepted.toLocaleString('nl-BE')}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">In behandeling</p>
                <p className="text-2xl font-bold text-amber-700">
                  €{revenuePending.toLocaleString('nl-BE')}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Totaal pipeline</span>
              <span className="text-sm font-bold text-slate-800">
                €{(revenueAccepted + revenuePending).toLocaleString('nl-BE')}
              </span>
            </div>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl"><Calendar size={18} className="text-blue-600" /></div>
                <h3 className="font-bold text-slate-900">Komende afspraken</h3>
              </div>
              <Link href="/dashboard/kalender" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Kalender →
              </Link>
            </div>
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <CalendarCheck size={24} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Geen aankomende afspraken</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((appt) => {
                  const d = new Date(appt.starts_at);
                  const name = appt.profile?.full_name ?? appt.profile?.email ?? appt.guest_name ?? appt.guest_email ?? 'Gast';
                  const dayLabel = d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });
                  const timeLabel = d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
                  const isPending = appt.status === 'pending';
                  return (
                    <div key={appt.id} className="flex items-center gap-3 px-6 py-3">
                      <div
                        className="w-1.5 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: appt.color ?? '#3b82f6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                        <p className="text-xs text-slate-400">{appt.type_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-slate-600">{timeLabel}</p>
                        <p className="text-xs text-slate-400">{dayLabel}</p>
                      </div>
                      {isPending && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md">
                          wacht
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminOnly>
      )}

      {/* Main content: packages CTA + activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Packages teaser */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden flex-1">
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-blue-200" />
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Pakketten</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Onze diensten</h2>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Van brochuresite tot webshop — bekijk onze pakketten en vraag een offerte aan.
              </p>
              <Link
                href="/dashboard/pakketten"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                <Package size={15} />
                Bekijk pakketten
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-50 rounded-xl"><User size={18} className="text-slate-600" /></div>
              <h3 className="font-bold text-slate-900">Mijn profiel</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Beheer je contactgegevens en openbare profielpagina.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Profiel bewerken <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Recente activiteit</h2>
            {isAdmin && (
              <AdminOnly>
                <Link
                  href="/dashboard/aanvragen"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Alle aanvragen →
                </Link>
              </AdminOnly>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Clock size={28} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-medium">Nog geen activiteit</p>
              <p className="text-xs text-slate-300 mt-1">
                Activiteit verschijnt hier zodra je een pakket aanvraagt of een bericht ontvangt.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                    <ActivityIcon type={item.type} status={item.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{formatTime(item.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact callout */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Heb je vragen of hulp nodig?</h3>
            <p className="text-sm text-slate-500">
              Neem contact op via{' '}
              <a href="mailto:info@intrict.com" className="font-semibold text-blue-600 hover:underline">
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
