'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { TimeLog } from '@/lib/types';

interface Props {
  initialLogs: TimeLog[];
  users: { id: string; full_name: string | null; email: string }[];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}u`;
  return `${h}u ${m}m`;
}

function groupByDate(logs: TimeLog[]): { date: string; logs: TimeLog[] }[] {
  const map = new Map<string, TimeLog[]>();
  for (const log of logs) {
    const arr = map.get(log.logged_date) ?? [];
    arr.push(log);
    map.set(log.logged_date, arr);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, logs]) => ({ date, logs }));
}

const today = new Date().toISOString().slice(0, 10);

export default function TijdregistratieClient({ initialLogs, users }: Props) {
  const [logs, setLogs]             = useState<TimeLog[]>(initialLogs);
  const [showForm, setShowForm]     = useState(false);
  const [filterUser, setFilterUser] = useState('');

  // Form state
  const [form, setForm] = useState({
    user_id:    users[0]?.id ?? '',
    logged_date: today,
    hours:      '1',
    minutes:    '0',
    description: '',
    billable:   true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);

  const handleAdd = async () => {
    const duration = parseInt(form.hours || '0') * 60 + parseInt(form.minutes || '0');
    if (!form.user_id || duration <= 0) {
      setFormError('Kies een klant en voer een geldige duur in.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/time-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:          form.user_id,
          logged_date:      form.logged_date,
          duration_minutes: duration,
          description:      form.description.trim() || undefined,
          billable:         form.billable,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Fout.'); return; }
      setLogs((prev) => [data as TimeLog, ...prev]);
      setShowForm(false);
      setForm((f) => ({ ...f, description: '', hours: '1', minutes: '0' }));
    } catch {
      setFormError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/time-logs/${id}`, { method: 'DELETE' });
    if (res.ok) setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const filtered = filterUser ? logs.filter((l) => l.user_id === filterUser) : logs;
  const grouped  = groupByDate(filtered);

  const totalMinutes = filtered.reduce((s, l) => s + l.duration_minutes, 0);
  const billableMin  = filtered.filter((l) => l.billable).reduce((s, l) => s + l.duration_minutes, 0);

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/kalender" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} />
          Kalender
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">Tijdregistratie</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-widest uppercase text-slate-400">Administrator</p>
          <h1 className="text-3xl font-bold text-slate-900">Tijdregistratie</h1>
          <p className="mt-1 text-sm text-slate-500">Log gewerkte uren per klant per dag.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all self-start lg:self-auto"
        >
          <Plus size={15} />
          Tijd loggen
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 mb-6 bg-white border shadow-sm border-slate-200 rounded-2xl"
          >
            <h3 className="mb-4 font-bold text-slate-900">Nieuwe tijdsregistratie</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* User */}
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-widest uppercase text-slate-500">
                  <User size={10} className="inline mr-1" />
                  Klant
                </label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name ?? u.email}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-widest uppercase text-slate-500">Datum</label>
                <input
                  type="date"
                  value={form.logged_date}
                  onChange={(e) => setForm((f) => ({ ...f, logged_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-widest uppercase text-slate-500">
                  <Clock size={10} className="inline mr-1" />
                  Duur
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={form.hours}
                    onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                    className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500">u</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={form.minutes}
                    onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
                    className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-500">min</span>
                </div>
              </div>

              {/* Billable */}
              <div className="flex items-center gap-3 pt-5">
                <button
                  onClick={() => setForm((f) => ({ ...f, billable: !f.billable }))}
                  className={`relative rounded-full transition-colors shrink-0`}
                  style={{
                    width: 40,
                    height: 22,
                    backgroundColor: form.billable ? '#2563eb' : '#e2e8f0',
                  }}
                >
                  <span
                    className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
                    style={{
                      width: 18,
                      height: 18,
                      left: 2,
                      transform: form.billable ? 'translateX(18px)' : 'translateX(0)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {form.billable ? 'Factureerbaar' : 'Niet factureerbaar'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block mb-2 text-xs font-semibold tracking-widest uppercase text-slate-500">Omschrijving</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Wat heb je gedaan?"
                className="w-full px-3 py-2 text-sm border resize-none border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
              />
            </div>

            {formError && (
              <div className="flex items-start gap-2 p-3 mt-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Annuleren
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
              >
                {submitting
                  ? <span className="w-4 h-4 border-2 rounded-full border-white/40 border-t-white animate-spin" />
                  : <CheckCircle size={14} />}
                {submitting ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <p className="mb-1 text-xs font-medium text-slate-400">Totaal</p>
          <p className="text-xl font-bold text-slate-900">{formatDuration(totalMinutes)}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <p className="mb-1 text-xs font-medium text-slate-400">Factureerbaar</p>
          <p className="text-xl font-bold text-green-600">{formatDuration(billableMin)}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <p className="mb-1 text-xs font-medium text-slate-400">Niet factureerbaar</p>
          <p className="text-xl font-bold text-slate-500">{formatDuration(totalMinutes - billableMin)}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <p className="mb-1 text-xs font-medium text-slate-400">Registraties</p>
          <p className="text-xl font-bold text-slate-900">{filtered.length}</p>
        </div>
      </div>

      {/* Filter by user */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Filter:</span>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Alle klanten</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name ?? u.email}</option>
          ))}
        </select>
      </div>

      {/* Log list grouped by date */}
      {grouped.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl">
          <Clock size={32} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">Nog geen tijdsregistraties.</p>
          <p className="mt-1 text-xs text-slate-300">Klik op &quot;Tijd loggen&quot; om te beginnen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ date, logs: dayLogs }) => {
            const dayTotal = dayLogs.reduce((s, l) => s + l.duration_minutes, 0);
            const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('nl-BE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            });
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                    {dateLabel}
                  </p>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {formatDuration(dayTotal)}
                  </span>
                </div>
                <div className="space-y-2">
                  {dayLogs.map((log) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const p = (log as any).profile;
                    return (
                      <div key={log.id} className="flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl">
                        <div className="p-2 rounded-lg bg-slate-50 shrink-0">
                          <Clock size={14} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {p?.full_name ?? p?.email ?? 'Klant'}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              log.billable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {log.billable ? 'Factureerbaar' : 'Intern'}
                            </span>
                          </div>
                          {log.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{log.description}</p>
                          )}
                        </div>
                        <div className="text-sm font-bold text-slate-700 shrink-0">
                          {formatDuration(log.duration_minutes)}
                        </div>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
