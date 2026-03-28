'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, FileText, Mail, AlertCircle, Info, Check } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; border: string; dot: string; label: string }> = {
  invoice: {
    icon:   <FileText size={16} className="text-green-600" />,
    bg:     'bg-green-50',
    border: 'border-green-200',
    dot:    'bg-green-500',
    label:  'Factuur',
  },
  file: {
    icon:   <FileText size={16} className="text-blue-600" />,
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    dot:    'bg-blue-500',
    label:  'Bestand',
  },
  message: {
    icon:   <Mail size={16} className="text-purple-600" />,
    bg:     'bg-purple-50',
    border: 'border-purple-200',
    dot:    'bg-purple-500',
    label:  'Bericht',
  },
  alert: {
    icon:   <AlertCircle size={16} className="text-red-600" />,
    bg:     'bg-red-50',
    border: 'border-red-200',
    dot:    'bg-red-500',
    label:  'Waarschuwing',
  },
  info: {
    icon:   <Info size={16} className="text-slate-500" />,
    bg:     'bg-slate-50',
    border: 'border-slate-200',
    dot:    'bg-slate-400',
    label:  'Info',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();

  const handleClick = async (n: Notification) => {
    await markRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="p-6 lg:p-10">

      {/* Page header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative p-3 shadow-lg rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 shadow-blue-200">
            <Bell size={22} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Meldingen</h1>
            <p className="text-slate-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} ongelezen melding${unreadCount > 1 ? 'en' : ''}` : 'Alles bijgewerkt'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Check size={15} />
            Alles als gelezen markeren
          </motion.button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white border rounded-2xl border-slate-100 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                <div className="w-1/2 h-3 rounded bg-slate-100" />
                <div className="h-2.5 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-16 text-center bg-white border shadow-sm rounded-2xl border-slate-100"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border rounded-2xl bg-slate-50 border-slate-100">
            <BellOff size={32} className="text-slate-300" />
          </div>
          <p className="text-lg font-semibold text-slate-600">Geen meldingen</p>
          <p className="mt-1 text-sm text-slate-400">Je ontvangt hier meldingen van facturen, bestanden en berichten.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                    !n.read
                      ? `${cfg.bg} ${cfg.border} shadow-sm hover:shadow-md`
                      : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-200 group-hover:scale-105 ${cfg.bg} ${cfg.border}`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${!n.read ? 'text-slate-600' : 'text-slate-400'}`}>
                            {cfg.label}
                          </span>
                          {!n.read && (
                            <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                          )}
                        </div>
                        <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700"
                          >
                            <Check size={11} />
                            Gelezen
                          </button>
                        )}
                      </div>
                    </div>
                    {n.link && (
                      <p className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-500 hover:text-blue-700">
                        Bekijk →
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}