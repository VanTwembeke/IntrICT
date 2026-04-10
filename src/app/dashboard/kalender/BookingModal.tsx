'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, CheckCircle, AlertCircle, ChevronRight, Users } from 'lucide-react';
import type { Appointment, AppointmentType } from '@/lib/types';

interface Props {
  date: Date;
  time: string;
  appointmentTypes: AppointmentType[];
  isAdmin: boolean;
  users: { id: string; full_name: string | null; email: string }[];
  currentUserId: string;
  onDone: (appt: Appointment) => void;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  '#10b981': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '#3b82f6': 'bg-blue-100    text-blue-700    border-blue-200',
  '#8b5cf6': 'bg-violet-100  text-violet-700  border-violet-200',
  '#f59e0b': 'bg-amber-100   text-amber-700   border-amber-200',
  '#ef4444': 'bg-red-100     text-red-700     border-red-200',
};

function colorClass(color: string) {
  return STATUS_COLOR[color] ?? 'bg-blue-100 text-blue-700 border-blue-200';
}

export default function BookingModal({
  date,
  time,
  appointmentTypes,
  isAdmin,
  users,
  currentUserId,
  onDone,
  onClose,
}: Props) {
  const [step, setStep]             = useState<1 | 2>(1);
  const [selectedType, setSelected] = useState<AppointmentType | null>(null);
  const [targetTime, setTargetTime] = useState(time);
  const [notes, setNotes]           = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [targetUser, setTargetUser] = useState(currentUserId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const dateLabel = date.toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setError(null);

    const [hours, minutes] = targetTime.split(':').map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(hours, minutes, 0, 0);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_type_id: selectedType.id,
          starts_at:  startsAt.toISOString(),
          notes:      notes.trim() || undefined,
          meeting_link: meetingLink.trim() || undefined,
          user_id:    isAdmin ? targetUser : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Er is een fout opgetreden.');
        return;
      }
      onDone(data as Appointment);
    } catch {
      setError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Afspraak inplannen</h2>
            <p className="text-sm text-slate-500 mt-0.5 capitalize">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Choose appointment type */}
          {step === 1 && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                  Kies een afspraaktype
                </p>
                <div className="space-y-2">
                  {appointmentTypes.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Geen afspraaktypes beschikbaar. Vraag de beheerder om typen toe te voegen.
                    </p>
                  )}
                  {appointmentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelected(type)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        selectedType?.id === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}20`, color: type.color }}
                      >
                        <Clock size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800">{type.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass(type.color)}`}>
                            {type.duration_minutes} min
                          </span>
                          {type.max_per_user !== null && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                              Max {type.max_per_user}×
                            </span>
                          )}
                          {type.requires_package && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-medium">
                              Pakket vereist
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                        )}
                      </div>
                      <ChevronRight size={16} className={selectedType?.id === type.id ? 'text-blue-500' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedType}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  Volgende →
                </button>
              </div>
            </>
          )}

          {/* Step 2: Time + details */}
          {step === 2 && selectedType && (
            <>
              {/* Selected type summary */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${selectedType.color}20`, color: selectedType.color }}
                >
                  <Clock size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{selectedType.name}</p>
                  <p className="text-xs text-slate-500">{selectedType.duration_minutes} minuten</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-blue-600 hover:underline"
                >
                  Wijzigen
                </button>
              </div>

              {/* Admin: select user */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    <Users size={11} className="inline mr-1" />
                    Klant
                  </label>
                  <select
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name ?? u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  Starttijd
                </label>
                <input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Eindtijd: {(() => {
                    const [h, m] = targetTime.split(':').map(Number);
                    const end = new Date();
                    end.setHours(h, m + selectedType.duration_minutes, 0, 0);
                    return end.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </p>
              </div>

              {/* Meeting link (admin) */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Teams / Meet link (optioneel)
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 transition-all"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                  Notitie (optioneel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Extra informatie, specifieke wensen..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 resize-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Terug
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle size={15} />
                  )}
                  {submitting ? 'Aanmaken...' : 'Bevestig afspraak'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
