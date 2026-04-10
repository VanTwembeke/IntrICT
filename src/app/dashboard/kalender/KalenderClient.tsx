'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Plus, Link2,
  Copy, Check, Settings, BarChart2, RefreshCw,
} from 'lucide-react';
import type { Appointment, AppointmentType, WorkingHour } from '@/lib/types';
import BookingModal from './BookingModal';
import AppointmentModal from './AppointmentModal';
import { useViewMode } from '@/components/dashboard/DashboardShell';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 56; // px per hour
const GRID_START  = 8;  // 08:00
const GRID_END    = 19; // 19:00
const HOURS       = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);

const DAY_NAMES_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

const STATUS_STYLE: Record<string, string> = {
  pending:   'border-l-amber-400  bg-amber-50  text-amber-900',
  confirmed: 'border-l-blue-500   bg-blue-50   text-blue-900',
  completed: 'border-l-green-500  bg-green-50  text-green-900',
  cancelled: 'border-l-slate-300  bg-slate-50  text-slate-500',
  no_show:   'border-l-red-300    bg-red-50    text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  pending:   'In behandeling',
  confirmed: 'Bevestigd',
  completed: 'Voltooid',
  cancelled: 'Geannuleerd',
  no_show:   'Niet verschenen',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekDays(anchor: Date): Date[] {
  const day = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatWeekLabel(days: Date[]): string {
  const from = days[0];
  const to   = days[6];
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (from.getMonth() === to.getMonth()) {
    return `${from.getDate()} – ${to.toLocaleDateString('nl-BE', opts)} ${to.getFullYear()}`;
  }
  return `${from.toLocaleDateString('nl-BE', opts)} – ${to.toLocaleDateString('nl-BE', opts)} ${to.getFullYear()}`;
}

function apptTop(appt: Appointment): number {
  const start    = new Date(appt.starts_at);
  const startMin = start.getHours() * 60 + start.getMinutes();
  return Math.max(0, (startMin - GRID_START * 60) / 60 * HOUR_HEIGHT);
}

function apptHeight(appt: Appointment): number {
  return Math.max(20, appt.duration_minutes / 60 * HOUR_HEIGHT - 2);
}

function isWorkingSlot(day: Date, hour: number, workingHours: WorkingHour[]): boolean {
  const wh = workingHours.find((w) => w.day_of_week === day.getDay());
  if (!wh || !wh.is_active) return false;
  const [sh] = wh.start_time.split(':').map(Number);
  const [eh] = wh.end_time.split(':').map(Number);
  return hour >= sh && hour < eh;
}

function isBreakSlot(day: Date, hour: number, workingHours: WorkingHour[]): boolean {
  const wh = workingHours.find((w) => w.day_of_week === day.getDay());
  if (!wh || !wh.break_start || !wh.break_end) return false;
  const [bsh] = wh.break_start.split(':').map(Number);
  const [beh] = wh.break_end.split(':').map(Number);
  return hour >= bsh && hour < beh;
}

// ─── Appointment block ────────────────────────────────────────────────────────

function AppointmentBlock({
  appt, isAdmin, onClick,
}: {
  appt: Appointment;
  isAdmin: boolean;
  onClick: (a: Appointment) => void;
}) {
  const start = new Date(appt.starts_at);
  const end   = new Date(appt.ends_at);
  const timeLabel = `${start.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`;
  const styleClass = STATUS_STYLE[appt.status] ?? STATUS_STYLE.pending;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(appt); }}
      style={{
        position: 'absolute',
        top:    `${apptTop(appt)}px`,
        height: `${apptHeight(appt)}px`,
        left: '3px',
        right: '3px',
        zIndex: 10,
      }}
      className={`border-l-4 rounded-lg px-2 py-1 text-left overflow-hidden transition-all hover:brightness-95 active:scale-[0.98] ${styleClass}`}
    >
      <p className="text-[11px] font-bold leading-tight truncate">
        {isAdmin ? (appt.profile?.full_name ?? appt.profile?.email ?? appt.guest_name ?? appt.guest_email ?? 'Gast') : appt.type_name}
      </p>
      <p className="text-[10px] leading-tight opacity-60 truncate">
        {isAdmin ? appt.type_name : timeLabel}
      </p>
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isAdmin: boolean;
  initialAppointments: Appointment[];
  appointmentTypes: AppointmentType[];
  workingHours: WorkingHour[];
  users: { id: string; full_name: string | null; email: string }[];
  calendarToken: string | null;
  currentUserId: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function KalenderClient({
  isAdmin,
  initialAppointments,
  appointmentTypes,
  workingHours,
  users,
  calendarToken,
  currentUserId,
}: Props) {
  const { viewAs } = useViewMode();
  const effectiveAdmin = isAdmin && viewAs === 'admin';

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [anchor, setAnchor]             = useState<Date>(() => new Date());
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);

  const [bookingSlot, setBookingSlot] = useState<{ date: Date; time: string } | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const weekDays = getWeekDays(anchor);
  const today    = new Date();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchWeek = useCallback(async (days: Date[]) => {
    setLoading(true);
    try {
      const from = days[0].toISOString();
      const to   = new Date(days[6].getTime() + 86399999).toISOString();
      const res  = await fetch(`/api/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if (res.ok) setAppointments(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = (delta: number) => {
    const next = new Date(anchor);
    next.setDate(anchor.getDate() + delta * 7);
    setAnchor(next);
    fetchWeek(getWeekDays(next));
  };

  const goToToday = () => {
    setAnchor(new Date());
    fetchWeek(getWeekDays(new Date()));
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSlotClick = (day: Date, hour: number) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    setBookingSlot({ date: day, time });
  };

  const handleBookingDone = (appt: Appointment) => {
    setAppointments((prev) =>
      [...prev, appt].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    );
    setBookingSlot(null);
  };

  const handleApptUpdated = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAppt(null);
  };

  const handleApptDeleted = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setSelectedAppt(null);
  };

  // ── iCal ──────────────────────────────────────────────────────────────────
  const feedUrl = calendarToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/calendar/feed?token=${calendarToken}`
    : null;

  const copyFeedUrl = async () => {
    if (!feedUrl) return;
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group appointments by day index
  const apptsByDay = weekDays.map((day) =>
    appointments.filter((a) => isSameDay(new Date(a.starts_at), day))
  );

  const activeAppts = appointments.filter((a) => a.status !== 'cancelled');

  return (
    <>
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {effectiveAdmin ? 'Administrator' : 'Gebruiker'}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Kalender</h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeAppts.length} afspraak{activeAppts.length !== 1 ? 'en' : ''} deze week
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {effectiveAdmin && (
            <>
              <a
                href="/dashboard/kalender/tijdregistratie"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                <BarChart2 size={15} />
                Tijdregistratie
              </a>
              <a
                href="/dashboard/kalender/werktijden"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                <Settings size={15} />
                Werktijden
              </a>
            </>
          )}
          <button
            onClick={() => setShowSyncPanel((v) => !v)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Link2 size={15} />
            Synchroniseren
          </button>
          <button
            onClick={() => setBookingSlot({ date: new Date(), time: '09:00' })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            <Plus size={15} />
            Afspraak
          </button>
        </div>
      </div>

      {/* ── Sync panel ── */}
      <AnimatePresence>
        {showSyncPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="font-bold text-slate-900 mb-1">Agenda synchroniseren</h3>
            <p className="text-sm text-slate-500 mb-4">
              Synchroniseer je Intrict-afspraken met Google Calendar, Apple Agenda, Outlook of
              elke andere app die iCal ondersteunt.
            </p>
            {feedUrl ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 truncate">
                  {feedUrl}
                </code>
                <button
                  onClick={copyFeedUrl}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shrink-0"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Gekopieerd!' : 'Kopieer'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-amber-600">Geen agenda-token. Ververs de pagina.</p>
            )}
            {feedUrl && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl.replace(/^https?:\/\//, 'webcal://'))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  + Google Calendar
                </a>
                <a
                  href={feedUrl.replace(/^https?:\/\//, 'webcal://')}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  + Apple Agenda / Outlook
                </a>
                <a
                  href={feedUrl}
                  download="intrict-afspraken.ics"
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Download .ics
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Week navigation ── */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => navigate(1)}  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
          <ChevronRight size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-48">
          {formatWeekLabel(weekDays)}
        </span>
        <button onClick={goToToday} className="px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
          Vandaag
        </button>
        {loading && <RefreshCw size={14} className="text-slate-400 animate-spin" />}
      </div>

      {/* ── Status legend ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              key === 'pending'   ? 'bg-amber-400' :
              key === 'confirmed' ? 'bg-blue-500'  :
              key === 'completed' ? 'bg-green-500' :
              key === 'no_show'   ? 'bg-red-400'   :
              'bg-slate-300'
            }`} />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Day header row */}
        <div className="flex border-b border-slate-100">
          {/* Gutter spacer */}
          <div className="w-14 shrink-0 border-r border-slate-100" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`flex-1 py-3 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>
                  {DAY_NAMES_SHORT[day.getDay()]}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Scrollable grid body */}
        <div className="overflow-y-auto" style={{ maxHeight: '62vh' }}>
          <div className="flex">
            {/* Time gutter */}
            <div className="w-14 shrink-0 border-r border-slate-100 bg-white">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex items-start justify-end pr-2 pt-1 border-b border-slate-100"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <span className="text-[10px] text-slate-400 font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const isToday  = isSameDay(day, today);
              const dayAppts = apptsByDay[di];
              const totalH   = HOURS.length * HOUR_HEIGHT;

              return (
                <div
                  key={di}
                  className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-blue-50/20' : ''}`}
                  style={{ height: `${totalH}px` }}
                >
                  {/* Hour slot backgrounds */}
                  {HOURS.map((hour, hi) => {
                    const working = isWorkingSlot(day, hour, workingHours);
                    const isBreak = isBreakSlot(day, hour, workingHours);
                    return (
                      <div
                        key={hour}
                        className={`absolute left-0 right-0 border-b border-slate-100 cursor-pointer group transition-colors
                          ${isBreak ? 'bg-amber-50/50' : working ? '' : 'bg-slate-50/60'}
                        `}
                        style={{ top: `${hi * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        onClick={() => handleSlotClick(day, hour)}
                      >
                        {/* Half-hour line */}
                        <div
                          className="absolute left-0 right-0 border-b border-dashed border-slate-100/80"
                          style={{ top: `${HOUR_HEIGHT / 2}px` }}
                        />
                        {/* Hover hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                          <Plus size={12} className="text-slate-200" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Appointment blocks */}
                  {dayAppts.map((appt) => {
                    const h = new Date(appt.starts_at).getHours();
                    if (h < GRID_START || h >= GRID_END) return null;
                    return (
                      <AppointmentBlock
                        key={appt.id}
                        appt={appt}
                        isAdmin={effectiveAdmin}
                        onClick={setSelectedAppt}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded bg-white border border-slate-200" />
            <span className="text-xs font-semibold text-slate-600">Werktijden</span>
          </div>
          <p className="text-xs text-slate-400">Witte achtergrond = beschikbaar</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-100" />
            <span className="text-xs font-semibold text-slate-600">Pauze</span>
          </div>
          <p className="text-xs text-slate-400">Gele achtergrond = pauzetijd</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Klik op tijdslot</span>
          </div>
          <p className="text-xs text-slate-400">Klik om een afspraak in te plannen</p>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {bookingSlot && (
          <BookingModal
            date={bookingSlot.date}
            time={bookingSlot.time}
            appointmentTypes={appointmentTypes}
            isAdmin={effectiveAdmin}
            users={users}
            currentUserId={currentUserId}
            onDone={handleBookingDone}
            onClose={() => setBookingSlot(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAppt && (
          <AppointmentModal
            appointment={selectedAppt}
            isAdmin={effectiveAdmin}
            onUpdated={handleApptUpdated}
            onDeleted={handleApptDeleted}
            onClose={() => setSelectedAppt(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
