'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { WorkingHour } from '@/lib/types';

const DAY_LABELS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

const DEFAULT_HOURS: WorkingHour[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i,
  start_time:  '09:00',
  end_time:    '18:00',
  is_active:   i >= 1 && i <= 5, // Mon–Fri
  break_start: '12:00',
  break_end:   '13:00',
}));

function mergeDefaults(saved: WorkingHour[]): WorkingHour[] {
  return DEFAULT_HOURS.map((def) => {
    const found = saved.find((s) => s.day_of_week === def.day_of_week);
    return found ?? def;
  });
}

interface Props {
  initialHours: WorkingHour[];
}

export default function WerktijdenClient({ initialHours }: Props) {
  const [hours, setHours] = useState<WorkingHour[]>(mergeDefaults(initialHours));
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const update = (dayOfWeek: number, field: keyof WorkingHour, value: string | boolean | null) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Fout bij opslaan.');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  // Build availability summary string for preview
  const summary = (() => {
    const active = hours.filter((h) => h.is_active);
    if (active.length === 0) return 'Niet beschikbaar';

    // Check if all active days have same hours
    const first = active[0];
    const allSame = active.every((h) => h.start_time === first.start_time && h.end_time === first.end_time);

    const dayNames = active.map((h) => DAY_LABELS[h.day_of_week].slice(0, 2));

    // Group consecutive days
    const grouped: string[] = [];
    let groupStart = 0;
    for (let i = 1; i <= active.length; i++) {
      if (i === active.length || active[i].day_of_week !== active[i - 1].day_of_week + 1) {
        if (i - groupStart > 2) {
          grouped.push(`${DAY_LABELS[active[groupStart].day_of_week].slice(0, 2)}–${DAY_LABELS[active[i - 1].day_of_week].slice(0, 2)}`);
        } else {
          for (let j = groupStart; j < i; j++) {
            grouped.push(dayNames[j]);
          }
        }
        groupStart = i;
      }
    }

    const daysStr = grouped.join(', ');
    if (allSame) {
      return `${daysStr}, ${first.start_time.slice(0, 5)} – ${first.end_time.slice(0, 5)}`;
    }
    return daysStr;
  })();

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/kalender"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={15} />
          Kalender
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">Werktijden</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Administrator</p>
        <h1 className="text-3xl font-bold text-slate-900">Werktijden</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stel je beschikbaarheid in. Dit wordt weergegeven op de contactpagina en gebruikt in de kalender.
        </p>
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
        <div className="text-2xl">🕐</div>
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Voorvertoning contactpagina</p>
          <p className="text-sm font-semibold text-blue-900 mt-0.5">{summary}</p>
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-3 mb-6">
        {hours.map((h) => (
          <motion.div
            key={h.day_of_week}
            layout
            className={`bg-white border rounded-2xl transition-all ${h.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'}`}
          >
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Toggle */}
              <button
                onClick={() => update(h.day_of_week, 'is_active', !h.is_active)}
                className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${h.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
                style={{ width: 40, height: 22 }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${h.is_active ? 'translate-x-4.5' : 'translate-x-0'}`}
                  style={{
                    width: 18,
                    height: 18,
                    transform: h.is_active ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Day name */}
              <p className={`w-24 font-semibold text-sm ${h.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                {DAY_LABELS[h.day_of_week]}
              </p>

              {h.is_active ? (
                <>
                  {/* Start time */}
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={h.start_time}
                      onChange={(e) => update(h.day_of_week, 'start_time', e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-slate-400 text-sm">–</span>
                    <input
                      type="time"
                      value={h.end_time}
                      onChange={(e) => update(h.day_of_week, 'end_time', e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Break toggle */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline">Pauze</span>
                    <input
                      type="time"
                      value={h.break_start ?? ''}
                      onChange={(e) => update(h.day_of_week, 'break_start', e.target.value || null)}
                      placeholder="–"
                      className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 w-20"
                    />
                    <span className="text-slate-300 text-xs">–</span>
                    <input
                      type="time"
                      value={h.break_end ?? ''}
                      onChange={(e) => update(h.day_of_week, 'break_end', e.target.value || null)}
                      placeholder="–"
                      className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 w-20"
                    />
                  </div>
                </>
              ) : (
                <span className="text-sm text-slate-400 ml-2">Niet beschikbaar</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle size={16} />
          )}
          {saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
        </button>

        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-sm font-semibold text-green-600"
          >
            <CheckCircle size={14} />
            Opgeslagen!
          </motion.span>
        )}
      </div>

      <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
        <h3 className="font-semibold text-slate-900 mb-2">Let op</h3>
        <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
          <li>Werktijden zijn zichtbaar op de contactpagina van de website.</li>
          <li>Grijze achtergrond in de kalender = buiten werktijd.</li>
          <li>Gele achtergrond in de kalender = pauzetijd.</li>
          <li>Afspraken kunnen nog steeds buiten werktijd worden ingepland (admin beheert dit).</li>
        </ul>
      </div>
    </>
  );
}
