'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, FileText, Mail, AlertCircle,
  Info, Check, CheckCheck, Sparkles,
} from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

/* ─── type config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; accent: string; pill: string; dot: string; label: string }
> = {
  invoice: {
    icon:   <FileText size={14} />,
    accent: 'text-emerald-600',
    pill:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot:    'bg-emerald-500',
    label:  'Factuur',
  },
  file: {
    icon:   <FileText size={14} />,
    accent: 'text-blue-600',
    pill:   'bg-blue-50 text-blue-700 border-blue-200',
    dot:    'bg-blue-500',
    label:  'Bestand',
  },
  message: {
    icon:   <Mail size={14} />,
    accent: 'text-violet-600',
    pill:   'bg-violet-50 text-violet-700 border-violet-200',
    dot:    'bg-violet-500',
    label:  'Bericht',
  },
  alert: {
    icon:   <AlertCircle size={14} />,
    accent: 'text-rose-600',
    pill:   'bg-rose-50 text-rose-700 border-rose-200',
    dot:    'bg-rose-500',
    label:  'Waarschuwing',
  },
  info: {
    icon:   <Info size={14} />,
    accent: 'text-slate-500',
    pill:   'bg-slate-50 text-slate-600 border-slate-200',
    dot:    'bg-slate-400',
    label:  'Info',
  },
};

/* ─── component ───────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, unreadCount, markRead, markAllRead } =
    useNotifications();

  const handleClick = async (n: Notification) => {
    await markRead(n.id);
    if (n.link) router.push(n.link);
  };

  const unread = notifications.filter((n) => !n.read);
  const read   = notifications.filter((n) =>  n.read);

  return (
    <div className="w-full">

      {/* ── Hero header — mirrors Contact page ─────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* Dot texture */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+")`,
            }}
          />
        </div>

        {/* Glow orbs */}
        <div className="absolute rounded-full pointer-events-none -right-24 -top-24 h-80 w-80 bg-blue-600/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-16 left-1/3 bg-violet-600/20 blur-3xl" />

        <div className="relative z-10 px-4 pt-10 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Title row */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  {/* Bell with badge */}
                  <div className="relative shrink-0">
                    <div className="flex items-center justify-center shadow-lg h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 shadow-blue-900/40">
                      <Bell size={24} className="text-white" />
                    </div>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-800 bg-rose-500 text-[10px] font-bold text-white"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={13} className="text-blue-400" />
                      <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
                        IntrICT Dashboard
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                      Meldingen
                    </h1>
                    <p className="mt-1 text-slate-400">
                      {unreadCount > 0
                        ? `${unreadCount} ongelezen melding${unreadCount > 1 ? 'en' : ''}`
                        : 'Alles bijgewerkt — goed bezig 🎉'}
                    </p>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={markAllRead}
                    className="flex items-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:self-auto"
                  >
                    <CheckCheck size={15} />
                    Alles als gelezen markeren
                  </motion.button>
                )}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4 mt-10">
                {[
                  { label: 'Totaal',    value: notifications.length,              color: 'text-white'       },
                  { label: 'Ongelezen', value: unreadCount,                        color: 'text-rose-400'    },
                  { label: 'Gelezen',   value: notifications.length - unreadCount, color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-5 py-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <section className="py-10 bg-linear-to-br from-slate-50 to-blue-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 bg-white border shadow-sm rounded-2xl border-slate-100 animate-pulse"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2.5">
                    <div className="w-2/3 h-3 rounded bg-slate-100" />
                    <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                    <div className="w-1/4 h-2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && notifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center bg-white border border-dashed shadow-sm rounded-3xl border-slate-200"
            >
              <div className="flex items-center justify-center w-20 h-20 mb-5 rounded-3xl bg-slate-50 ring-1 ring-slate-100">
                <BellOff size={36} className="text-slate-300" />
              </div>
              <p className="text-lg font-semibold text-slate-700">Geen meldingen</p>
              <p className="mt-1.5 max-w-xs text-sm text-slate-400">
                Je ontvangt hier meldingen van facturen, bestanden en berichten.
              </p>
            </motion.div>
          )}

          {/* Unread section */}
          {!loading && unread.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Ongelezen</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 text-[11px] font-bold text-rose-600">
                  {unread.length}
                </span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {unread.map((n, i) => (
                    <NotifCard key={n.id} n={n} i={i} onRead={markRead} onClick={handleClick} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Read section */}
          {!loading && read.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Gelezen</span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {read.map((n, i) => (
                    <NotifCard key={n.id} n={n} i={i} onRead={markRead} onClick={handleClick} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

/* ─── single card ─────────────────────────────────────────────────────────── */
function NotifCard({
  n, i, onRead, onClick,
}: {
  n: Notification;
  i: number;
  onRead: (id: string) => void;
  onClick: (n: Notification) => void;
}) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
      transition={{ delay: i * 0.04 }}
      onClick={() => onClick(n)}
      className={`group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-200 ${
        !n.read
          ? 'border-blue-100 bg-white shadow-md shadow-blue-50 hover:shadow-lg hover:shadow-blue-100'
          : 'border-slate-100 bg-white/60 shadow-sm hover:bg-white hover:shadow-md'
      }`}
    >
      {/* unread left accent bar */}
      {!n.read && (
        <span className="absolute left-0 w-1 rounded-full top-3 bottom-3 bg-linear-to-b from-blue-500 to-violet-500" />
      )}

      {/* icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${cfg.accent} border-slate-100`}
      >
        {cfg.icon}
      </div>

      {/* body */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.pill}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          {!n.read && <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />}
        </div>
        <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
        )}
        {n.link && (
          <span className="mt-1.5 inline-block text-xs font-semibold text-blue-500 hover:text-blue-700">
            Bekijk →
          </span>
        )}
      </div>

      {/* right side */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="text-xs whitespace-nowrap text-slate-400">
          {new Date(n.created_at).toLocaleString('nl-BE', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
        {!n.read && (
          <button
            onClick={(e) => { e.stopPropagation(); onRead(n.id); }}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Check size={11} />
            Gelezen
          </button>
        )}
      </div>
    </motion.div>
  );
}