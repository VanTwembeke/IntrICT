'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { WorkingHour, AppointmentType } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Januari','Februari','Maart','April','Mei','Juni',
  'Juli','Augustus','September','Oktober','November','December',
];
const DAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const first  = new Date(year, month, 1);
  const last   = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isAvailableDay(date: Date, wh: WorkingHour[]): boolean {
  return !!wh.find((w) => w.day_of_week === date.getDay())?.is_active;
}

function getTimeSlots(date: Date, wh: WorkingHour): string[] {
  const [sh, sm] = wh.start_time.split(':').map(Number);
  const [eh, em] = wh.end_time.split(':').map(Number);
  const bs = wh.break_start ? wh.break_start.split(':').map(Number) : null;
  const be = wh.break_end   ? wh.break_end.split(':').map(Number)   : null;
  const now = new Date();
  const todayMin = isSameDay(date, now) ? now.getHours() * 60 + now.getMinutes() + 60 : 0;

  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const end = eh * 60 + em - 30;
  while (cur <= end) {
    const inBreak = bs && be && cur >= bs[0] * 60 + bs[1] && cur < be[0] * 60 + be[1];
    if (!inBreak && cur >= todayMin) {
      slots.push(`${Math.floor(cur / 60).toString().padStart(2, '0')}:${(cur % 60).toString().padStart(2, '0')}`);
    }
    cur += 30;
  }
  return slots;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface AppointmentSelection {
  date: Date;
  time: string;
  type: AppointmentType;
}

interface Props {
  onChange: (selection: AppointmentSelection | null) => void;
}

export default function InlineAppointmentPicker({ onChange }: Props) {
  const today = new Date();

  const [monthOffset, setMonthOffset]   = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [apptTypes, setApptTypes]       = useState<AppointmentType[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/working-hours').then((r) => r.json()),
      fetch('/api/appointment-types').then((r) => r.json()),
    ]).then(([hours, types]) => {
      const wh = Array.isArray(hours) ? hours : [];
      const at = (Array.isArray(types) ? types : []).filter(
        (t: AppointmentType) => t.active && !t.requires_package
      );
      setWorkingHours(wh);
      setApptTypes(at);
      if (at.length > 0) setSelectedType(at[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Notify parent whenever selection changes
  useEffect(() => {
    if (selectedDate && selectedTime && selectedType) {
      onChange({ date: selectedDate, time: selectedTime, type: selectedType });
    } else {
      onChange(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime, selectedType]);

  const viewYearAdj  = today.getFullYear() + Math.floor((today.getMonth() + monthOffset) / 12);
  const viewMonth    = (today.getMonth() + monthOffset + 120) % 12;
  const grid         = getMonthGrid(viewYearAdj, viewMonth);
  const whForDay     = (d: Date) => workingHours.find((w) => w.day_of_week === d.getDay());
  const timeSlots    = selectedDate && whForDay(selectedDate)
    ? getTimeSlots(selectedDate, whForDay(selectedDate)!)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (apptTypes.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        Geen beschikbare sessies. Stuur ons direct een bericht.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type selector — only shown when multiple types */}
      {apptTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {apptTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setSelectedType(t); setSelectedDate(null); setSelectedTime(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                selectedType?.id === t.id
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Clock size={13} />
              {t.name}
              <span className={`text-xs ml-0.5 ${selectedType?.id === t.id ? 'text-blue-200' : 'text-slate-400'}`}>
                {t.duration_minutes} min
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Selected type summary (single type) */}
      {apptTypes.length === 1 && selectedType && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={13} className="text-blue-400" />
          <span className="font-semibold text-slate-700">{selectedType.name}</span>
          <span>— {selectedType.duration_minutes} min</span>
          {selectedType.max_per_user === 1 && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">Gratis</span>
          )}
        </div>
      )}

      {/* Month nav + calendar grid */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => { if (monthOffset > 0) { setMonthOffset((o) => o - 1); setSelectedDate(null); setSelectedTime(null); } }}
            disabled={monthOffset === 0}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-bold text-slate-800">
            {MONTH_NAMES[viewMonth]} {viewYearAdj}
          </span>
          <button
            type="button"
            onClick={() => { if (monthOffset < 3) { setMonthOffset((o) => o + 1); setSelectedDate(null); setSelectedTime(null); } }}
            disabled={monthOffset >= 3}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((date, i) => {
            if (!date) return <div key={i} />;
            const past       = isPast(date);
            const available  = isAvailableDay(date, workingHours);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
            const isToday    = isSameDay(date, today);
            return (
              <button
                key={i}
                type="button"
                onClick={() => { if (!past && available) { setSelectedDate(date); setSelectedTime(null); } }}
                disabled={past || !available}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                  ${isSelected ? 'bg-blue-600 text-white shadow-sm' : ''}
                  ${!isSelected && isToday && available && !past ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : ''}
                  ${!isSelected && available && !past ? 'hover:bg-white hover:shadow-sm text-slate-700 cursor-pointer' : ''}
                  ${past || !available ? 'text-slate-300 cursor-not-allowed' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {selectedDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {timeSlots.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Geen beschikbare tijdstippen op deze dag.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      selectedTime === slot
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection summary */}
      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm"
          >
            <span className="text-blue-500">✓</span>
            <span className="font-semibold text-blue-800 capitalize">
              {selectedDate.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })} om {selectedTime}
            </span>
            <span className="text-blue-500 text-xs ml-auto">{selectedType?.duration_minutes} min</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
