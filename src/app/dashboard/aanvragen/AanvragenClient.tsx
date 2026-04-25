'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Phone, Mail, Building2, CheckCircle, XCircle, MessageSquare,
  ChevronDown, Euro, User, Filter,
} from 'lucide-react';
import type { PackageRequest } from '@/lib/types';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS = {
  pending:   { label: 'Nieuw',        color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  contacted: { label: 'Gecontacteerd', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  accepted:  { label: 'Geaccepteerd', color: 'bg-green-100 text-green-700',   dot: 'bg-green-400' },
  rejected:  { label: 'Afgewezen',    color: 'bg-slate-100 text-slate-500',   dot: 'bg-slate-400' },
} as const;

type Status = keyof typeof STATUS;

// ─── Request card ─────────────────────────────────────────────────────────────

function RequestCard({
  req,
  onStatusChange,
}: {
  req: PackageRequest;
  onStatusChange: (id: string, status: Status, adminNotes: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<Status>(req.status as Status);
  const [adminNotes, setAdminNotes] = useState(req.admin_notes ?? '');
  const [saving, setSaving] = useState(false);

  const cfg = STATUS[status];
  const profile = req.profile;
  const date = new Date(req.created_at).toLocaleDateString('nl-BE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(req.id, status, adminNotes);
    setSaving(false);
    setExpanded(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900">
              {profile?.full_name ?? req.guest_name ?? 'Onbekend'}
            </p>
            {!req.user_id && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-violet-100 text-violet-700">
                Lead
              </span>
            )}
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {req.package_name} · €{req.package_price.toLocaleString('nl-BE')} · {date}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Authenticated user */}
                {profile?.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Mail size={14} className="shrink-0" />
                    {profile.email}
                  </a>
                )}
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="shrink-0" />
                    {profile.phone}
                  </a>
                )}
                {profile?.company && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={14} className="shrink-0" />
                    {profile.company}
                  </div>
                )}
                {/* Guest lead */}
                {!req.user_id && req.guest_email && (
                  <a href={`mailto:${req.guest_email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Mail size={14} className="shrink-0" />
                    {req.guest_email}
                  </a>
                )}
                {!req.user_id && req.guest_phone && (
                  <a href={`tel:${req.guest_phone}`} className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="shrink-0" />
                    {req.guest_phone}
                  </a>
                )}
                {!req.user_id && req.guest_company && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={14} className="shrink-0" />
                    {req.guest_company}
                  </div>
                )}
                {!req.user_id && req.guest_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={14} className="shrink-0" />
                    {req.guest_name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Euro size={14} className="shrink-0" />
                  {req.package_name} — €{req.package_price.toLocaleString('nl-BE')}
                </div>
              </div>

              {/* User notes */}
              {req.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Bericht van gebruiker
                  </p>
                  {req.notes}
                </div>
              )}

              {/* Status update */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status bijwerken</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS) as Status[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        status === s
                          ? `${STATUS[s].color} border-current`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${STATUS[s].dot}`} />
                      {STATUS[s].label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Interne notitie
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="Notities voor intern gebruik..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setExpanded(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
                  >
                    {saving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const FILTERS: { id: Status | 'all'; label: string }[] = [
  { id: 'all',       label: 'Alle' },
  { id: 'pending',   label: 'Nieuw' },
  { id: 'contacted', label: 'Gecontacteerd' },
  { id: 'accepted',  label: 'Geaccepteerd' },
  { id: 'rejected',  label: 'Afgewezen' },
];

interface Props {
  initialRequests: PackageRequest[];
}

export default function AanvragenClient({ initialRequests }: Props) {
  const [requests, setRequests] = useState<PackageRequest[]>(initialRequests);
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const counts: Record<Status | 'all', number> = {
    all:       requests.length,
    pending:   requests.filter((r) => r.status === 'pending').length,
    contacted: requests.filter((r) => r.status === 'contacted').length,
    accepted:  requests.filter((r) => r.status === 'accepted').length,
    rejected:  requests.filter((r) => r.status === 'rejected').length,
  };

  const handleStatusChange = async (id: string, status: Status, adminNotes: string) => {
    const res = await fetch(`/api/package-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Administrator
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Pakketaanvragen</h1>
        <p className="text-sm text-slate-500 mt-1">
          {counts.pending} nieuw · {counts.all} totaal
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Filter size={15} className="text-slate-400 mt-2.5 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">({counts[f.id]})</span>
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200"
            >
              <MessageSquare size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {filter === 'all' ? 'Nog geen aanvragen.' : `Geen aanvragen met status "${STATUS[filter as Status].label}".`}
              </p>
            </motion.div>
          )}
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              onStatusChange={handleStatusChange}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
