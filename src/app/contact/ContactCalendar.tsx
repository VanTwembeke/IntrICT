'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, CalendarDays, AlertCircle } from 'lucide-react';
import type { WorkingHour, AppointmentType } from '@/lib/types';

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Januari','Februari','Maart','April','Mei','Juni',
  'Juli','Augustus','September','Oktober','November','December',
];
const DAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7; // Mon=0
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isAvailableDay(date: Date, workingHours: WorkingHour[]): boolean {
  const wh = workingHours.find((w) => w.day_of_week === date.getDay());
  return !!wh?.is_active;
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

function getTimeSlots(date: Date, wh: WorkingHour): string[] {
  const [sh, sm] = wh.start_time.split(':').map(Number);
  const [eh, em] = wh.end_time.split(':').map(Number);
  const bs = wh.break_start ? wh.break_start.split(':').map(Number) : null;
  const be = wh.break_end   ? wh.break_end.split(':').map(Number)   : null;

  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const end = eh * 60 + em - 30; // need at least 30 min before closing

  // Don't show past slots for today
  const now = new Date();
  const todayMinutes = isSameDay(date, now)
    ? now.getHours() * 60 + now.getMinutes() + 60 // +60 min buffer
    : 0;

  while (cur <= end) {
    const inBreak = bs && be && cur >= bs[0] * 60 + bs[1] && cur < be[0] * 60 + be[1];
    if (!inBreak && cur >= todayMinutes) {
      const h = Math.floor(cur / 60).toString().padStart(2, '0');
      const m = (cur % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
    cur += 30;
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactCalendar() {
  const today = new Date();

  const [monthOffset, setMonthOffset]   = useState(0); // 0 = current month
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);

  const [workingHours, setWorkingHours]     = useState<WorkingHour[]>([]);
  const [appointmentTypes, setApptTypes]    = useState<AppointmentType[]>([]);
  const [loadingData, setLoadingData]       = useState(true);

  const [step, setStep] = useState<'calendar' | 'form' | 'done'>('calendar');
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [confirmedAppt, setConfirmedAppt] = useState<{ date: Date; time: string; type: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/working-hours').then((r) => r.json()),
      fetch('/api/appointment-types').then((r) => r.json()),
    ]).then(([hours, types]) => {
      setWorkingHours(Array.isArray(hours) ? hours : []);
      // Only show public (non-package-required) types
      const publicTypes = (Array.isArray(types) ? types : []).filter(
        (t: AppointmentType) => t.active && !t.requires_package
      );
      setApptTypes(publicTypes);
      if (publicTypes.length > 0) setSelectedType(publicTypes[0]);
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, []);

  const viewYear  = today.getFullYear();
  const viewMonth = (today.getMonth() + monthOffset + 12) % 12;
  const viewYearAdj = today.getFullYear() + Math.floor((today.getMonth() + monthOffset) / 12);

  const grid = getMonthGrid(viewYearAdj, viewMonth);

  const workingHourForDay = (date: Date) =>
    workingHours.find((w) => w.day_of_week === date.getDay());

  const timeSlots = selectedDate && workingHourForDay(selectedDate)
    ? getTimeSlots(selectedDate, workingHourForDay(selectedDate)!)
    : [];

  const handleDateClick = (date: Date) => {
    if (isPast(date) || !isAvailableDay(date, workingHours)) return;
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('calendar');
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !selectedType) return;
    setStep('form');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedType) return;
    if (!form.name.trim() || !form.email.trim()) {
      setError('Naam en e-mailadres zijn verplicht.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const [h, m] = selectedTime.split(':').map(Number);
    const starts = new Date(selectedDate);
    starts.setHours(h, m, 0, 0);

    try {
      const res = await fetch('/api/appointments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name:           form.name.trim(),
          guest_email:          form.email.trim(),
          appointment_type_id:  selectedType.id,
          starts_at:            starts.toISOString(),
          notes:                form.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Er is een fout opgetreden.'); return; }

      setConfirmedAppt({ date: selectedDate, time: selectedTime, type: selectedType.name });
      setStep('done');
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (appointmentTypes.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        Geen afspraakmogelijkheden beschikbaar. Neem direct contact op via e-mail.
      </div>
    );
  }

  // ── Done state ───────────────────────────────────────────────────────────────
  if (step === 'done' && confirmedAppt) {
    const dateLabel = confirmedAppt.date.toLocaleDateString('nl-BE', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-10 px-4"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Afspraak aangevraagd!</h3>
        <p className="text-slate-500 text-sm mb-4 max-w-xs">
          We bevestigen zo snel mogelijk per e-mail. Je ontvangt een bevestiging op <strong>{form.email}</strong>.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm space-y-1 mb-6 text-left w-full max-w-xs">
          <p><span className="font-semibold text-slate-600">Type:</span> {confirmedAppt.type}</p>
          <p className="capitalize"><span className="font-semibold text-slate-600">Datum:</span> {dateLabel}</p>
          <p><span className="font-semibold text-slate-600">Tijdstip:</span> {confirmedAppt.time}</p>
        </div>
        <button
          onClick={() => { setStep('calendar'); setSelectedDate(null); setSelectedTime(null); setForm({ name: '', email: '', notes: '' }); }}
          className="text-sm text-blue-600 hover:underline"
        >
          Nieuwe afspraak inplannen
        </button>
      </motion.div>
    );
  }

  // ── Form step ────────────────────────────────────────────────────────────────
  if (step === 'form') {
    const dateLabel = selectedDate?.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-5"
      >
        {/* Summary */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <CalendarDays size={20} className="text-blue-500 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 text-sm capitalize">{dateLabel} — {selectedTime}</p>
            <p className="text-xs text-blue-600">{selectedType?.name} · {selectedType?.duration_minutes} min</p>
          </div>
          <button onClick={() => setStep('calendar')} className="ml-auto text-xs text-blue-500 hover:underline shrink-0">
            Wijzigen
          </button>
        </div>

        {/* Appointment type picker (if multiple) */}
        {appointmentTypes.length > 1 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Afspraaktype</label>
            <div className="space-y-2">
              {appointmentTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all text-sm ${
                    selectedType?.id === t.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <Clock size={15} className="text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{t.duration_minutes} min</span>
                    {t.max_per_user === 1 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Gratis</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Naam *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Je volledige naam"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">E-mail *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jouw@email.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Bericht (optioneel)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Vertel kort wat je wil bespreken..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400 resize-none transition-all"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep('calendar')}
            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Terug
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim() || !form.email.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all"
          >
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <CheckCircle size={15} />}
            {submitting ? 'Verzenden...' : 'Afspraak bevestigen'}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Calendar step ────────────────────────────────────────────────────────────
  const canGoPrev = monthOffset > 0;
  const canGoNext = monthOffset < 3; // max 3 months ahead

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (canGoPrev) { setMonthOffset((o) => o - 1); setSelectedDate(null); setSelectedTime(null); } }}
          disabled={!canGoPrev}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-bold text-slate-900">
          {MONTH_NAMES[viewMonth]} {viewYearAdj}
        </span>
        <button
          onClick={() => { if (canGoNext) { setMonthOffset((o) => o + 1); setSelectedDate(null); setSelectedTime(null); } }}
          disabled={!canGoNext}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((date, i) => {
          if (!date) return <div key={i} />;

          const past      = isPast(date);
          const available = isAvailableDay(date, workingHours);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday   = isSameDay(date, today);

          return (
            <button
              key={i}
              onClick={() => handleDateClick(date)}
              disabled={past || !available}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                ${!isSelected && isToday && available && !past ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200' : ''}
                ${!isSelected && available && !past ? 'hover:bg-blue-50 hover:text-blue-700 text-slate-700 cursor-pointer' : ''}
                ${past || !available ? 'text-slate-300 cursor-not-allowed' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time slot picker */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Kies een tijdstip — {selectedDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {timeSlots.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Geen beschikbare tijdstippen op deze dag.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeClick(slot)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedTime === slot
                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm"
                >
                  <CalendarDays size={15} />
                  Doorgaan met {selectedTime}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Geselecteerd
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Niet beschikbaar
        </span>
      </div>
    </div>
  );
}
