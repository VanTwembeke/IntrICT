'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Clock, User, Mail, ExternalLink, CheckCircle, Trash2,
  AlertCircle, MapPin, FileText, Link2,
} from 'lucide-react';
import type { Appointment } from '@/lib/types';

interface Props {
  appointment: Appointment;
  isAdmin: boolean;
  onUpdated: (a: Appointment) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'In behandeling', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'Bevestigd',       color: 'bg-blue-100  text-blue-700  border-blue-200' },
  { value: 'completed', label: 'Voltooid',        color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Geannuleerd',     color: 'bg-slate-100 text-slate-500 border-slate-200' },
  { value: 'no_show',   label: 'Niet verschenen', color: 'bg-red-100   text-red-600   border-red-200' },
] as const;

export default function AppointmentModal({ appointment, isAdmin, onUpdated, onDeleted, onClose }: Props) {
  const [status, setStatus]         = useState(appointment.status);
  const [adminNotes, setAdminNotes] = useState(appointment.admin_notes ?? '');
  const [meetingLink, setMeetingLink] = useState(appointment.meeting_link ?? '');
  const [location, setLocation]     = useState(appointment.location ?? '');
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const start = new Date(appointment.starts_at);
  const end   = new Date(appointment.ends_at);

  const dateLabel = start.toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = `${start.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}`;

  const currentStatusCfg = STATUS_OPTIONS.find((s) => s.value === status)!;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_notes:  adminNotes.trim() || null,
          meeting_link: meetingLink.trim() || null,
          location:     location.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Fout bij opslaan.'); return; }
      onUpdated(data as Appointment);
    } catch {
      setError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserCancel = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (res.ok) onUpdated(data as Appointment);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, { method: 'DELETE' });
      if (res.ok) onDeleted(appointment.id);
    } finally {
      setDeleting(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-start justify-between p-6 border-b border-slate-100 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{appointment.type_name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${currentStatusCfg.color}`}>
                {currentStatusCfg.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 capitalize">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} className="text-slate-400 shrink-0" />
              {timeLabel}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={14} className="text-slate-400 shrink-0" />
              {appointment.duration_minutes} minuten
            </div>
            {appointment.profile && (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                  <User size={14} className="text-slate-400 shrink-0" />
                  {appointment.profile.full_name ?? appointment.profile.email}
                </div>
                <div className="col-span-2">
                  <a
                    href={`mailto:${appointment.profile.email}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Mail size={14} className="shrink-0" />
                    {appointment.profile.email}
                  </a>
                </div>
              </>
            )}
            {appointment.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                {appointment.location}
              </div>
            )}
            {appointment.meeting_link && !isAdmin && (
              <div className="col-span-2">
                <a
                  href={appointment.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink size={14} className="shrink-0" />
                  Meeting openen
                </a>
              </div>
            )}
          </div>

          {/* User notes */}
          {appointment.notes && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                <FileText size={10} className="inline mr-1" />
                Notitie van klant
              </p>
              <p className="text-sm text-slate-600">{appointment.notes}</p>
            </div>
          )}

          {/* Admin: edit fields */}
          {isAdmin ? (
            <>
              {/* Status */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                        status === opt.value ? opt.color : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meeting link */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  <Link2 size={10} className="inline mr-1" />
                  Teams / Meet link
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://teams.microsoft.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  <MapPin size={10} className="inline mr-1" />
                  Locatie (optioneel)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Gent, of online"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Admin notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Interne notitie
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Intern gebruik..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder:text-slate-400 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                {/* Delete */}
                {confirmDelete ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-70 transition-all"
                  >
                    {deleting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Trash2 size={14} />}
                    Zeker verwijderen
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-2.5 text-slate-400 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle size={14} />}
                  Opslaan
                </button>
              </div>
            </>
          ) : (
            /* User: only cancel if pending */
            appointment.status === 'pending' && (
              <button
                onClick={handleUserCancel}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 disabled:opacity-70 transition-all"
              >
                {saving ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <X size={14} />}
                Afspraak annuleren
              </button>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
