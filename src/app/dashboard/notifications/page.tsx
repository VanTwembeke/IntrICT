'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, FileText, Mail, AlertCircle, Info, Check } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode; bg: string; border: string; dot: string; label: string;
}> = {
  invoice: { icon: <FileText size={14} className="text-emerald-400" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500', label: 'Factuur' },
  file:    { icon: <FileText size={14} className="text-blue-400" />,    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-500',    label: 'Bestand' },
  message: { icon: <Mail size={14} className="text-purple-400" />,      bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  dot: 'bg-purple-500',  label: 'Bericht' },
  alert:   { icon: <AlertCircle size={14} className="text-red-400" />,  bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-500',     label: 'Waarschuwing' },
  info:    { icon: <Info size={14} className="text-slate-400" />,       bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-500',   label: 'Info' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();

  const handleClick = async (n: Notification) => {
    await markRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Hero */}
      <section className="relative max-w-4xl px-4 pt-24 pb-8 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative p-3 shadow-xl rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-blue-900/40">
              <Bell size={22} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">Notificaties</p>
              <h1 className="text-3xl font-bold text-white">Meldingen</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {unreadCount > 0 ? `${unreadCount} ongelezen` : 'Alles bijgewerkt'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={markAllRead}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all"
            >
              <Check size={14} /> Alles gelezen
            </motion.button>
          )}
        </div>
      </section>

      <div className="relative max-w-4xl px-4 pb-20 mx-auto sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-5 border rounded-2xl border-white/5 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/8 shrink-0" />
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-3.5 bg-white/8 rounded w-2/3" />
                  <div className="w-1/2 h-3 rounded bg-white/8" />
                  <div className="h-2.5 bg-white/8 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-16 text-center border rounded-2xl border-white/8 bg-white/2"
          >
            <div className="flex items-center justify-center mx-auto mb-4 border w-14 h-14 rounded-2xl bg-white/5 border-white/8">
              <BellOff size={26} className="text-slate-600" />
            </div>
            <p className="font-semibold text-slate-400">Geen meldingen</p>
            <p className="mt-1 text-sm text-slate-600">Je ontvangt hier meldingen van facturen, bestanden en berichten.</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                      !n.read
                        ? `${cfg.bg} ${cfg.border} hover:brightness-110`
                        : 'bg-white/2 border-white/6 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border shrink-0 ${cfg.bg} ${cfg.border}`}>{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} text-slate-400`}>
                              {cfg.label}
                            </span>
                            {!n.read && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />}
                          </div>
                          <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-white' : 'text-slate-400'}`}>{n.title}</p>
                          {n.body && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.body}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-xs text-slate-600 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                          {!n.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                              <Check size={10} /> Gelezen
                            </button>
                          )}
                        </div>
                      </div>
                      {n.link && <p className="mt-1.5 text-xs text-blue-400 font-medium">Bekijk →</p>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}