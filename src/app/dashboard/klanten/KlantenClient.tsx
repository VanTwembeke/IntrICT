'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, LayoutGrid, List, ArrowRight, Building2, X, Mail, CheckCircle } from 'lucide-react';
import type { ClientDossier, DossierStatus } from '@/lib/types';

const STAGES: { key: DossierStatus; label: string; color: string; bg: string; dot: string }[] = [
  { key: 'lead',      label: 'Lead',      color: 'text-slate-600',  bg: 'bg-slate-50  border-slate-200',  dot: 'bg-slate-400'  },
  { key: 'prospect',  label: 'Prospect',  color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200',   dot: 'bg-blue-500'   },
  { key: 'klant',     label: 'Klant',     color: 'text-green-600',  bg: 'bg-green-50  border-green-200',  dot: 'bg-green-500'  },
  { key: 'completed', label: 'Voltooid',  color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
];

const STATUS_BADGE: Record<DossierStatus, string> = {
  lead:      'bg-slate-100 text-slate-600',
  prospect:  'bg-blue-100 text-blue-700',
  klant:     'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
};

function initials(name: string | null, email: string) {
  const s = name ?? email;
  return s.slice(0, 2).toUpperCase();
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (email: string) => void }) {
  const [form, setForm] = useState({ email: '', full_name: '', company: '', phone: '', vat_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) { setError('E-mailadres is verplicht.'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Er is een fout opgetreden.'); return; }
      onSuccess(form.email);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative z-10 w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nieuwe klant uitnodigen</h2>
            <p className="text-xs text-slate-400 mt-0.5">Klant ontvangt een uitnodigingslink per e-mail</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mailadres *</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              placeholder="klant@bedrijf.be"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Naam</label>
              <input type="text" value={form.full_name} onChange={set('full_name')} placeholder="Jan Jansen"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Telefoon</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+32 …"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bedrijf</label>
            <input type="text" value={form.company} onChange={set('company')} placeholder="Bedrijfsnaam"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">BTW-nummer</label>
            <input type="text" value={form.vat_number} onChange={set('vat_number')} placeholder="BE 0000.000.000"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 mt-2"
          >
            <Mail size={15} />
            {saving ? 'Uitnodiging versturen…' : 'Uitnodiging versturen'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function InviteSuccessModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative z-10 w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-2xl"
      >
        <div className="flex items-center justify-center mx-auto mb-4 bg-green-100 rounded-full w-14 h-14">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-slate-900">Uitnodiging verstuurd!</h2>
        <p className="mb-1 text-sm text-slate-500">
          Een uitnodigingslink is verstuurd naar:
        </p>
        <p className="mb-5 font-semibold text-blue-600">{email}</p>
        <p className="mb-6 text-xs text-slate-400">
          De klant ontvangt een e-mail met een link om een wachtwoord in te stellen en toegang te krijgen tot het klantportaal.
          Een dossier wordt automatisch aangemaakt zodra zij zich aanmelden.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm"
        >
          Sluiten
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function KlantenClient({ initialDossiers }: { initialDossiers: ClientDossier[] }) {
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const filtered = dossiers.filter((d) => {
    const q = search.toLowerCase();
    return !q ||
      d.profile?.full_name?.toLowerCase().includes(q) ||
      d.profile?.email?.toLowerCase().includes(q) ||
      d.profile?.company?.toLowerCase().includes(q);
  });

  const byStage = (status: DossierStatus) => filtered.filter((d) => d.status === status);

  const handleStatusChange = async (id: string, status: DossierStatus) => {
    await fetch(`/api/dossiers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setDossiers((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
  };

  const totalActive = dossiers.filter((d) => d.status === 'klant').length;
  const totalLeads  = dossiers.filter((d) => d.status === 'lead' || d.status === 'prospect').length;

  return (
    <div className="space-y-6">
      {/* Modals */}
      <AnimatePresence>
        {showInvite && (
          <InviteClientModal
            onClose={() => setShowInvite(false)}
            onSuccess={(email) => { setShowInvite(false); setInvitedEmail(email); }}
          />
        )}
        {invitedEmail && (
          <InviteSuccessModal email={invitedEmail} onClose={() => setInvitedEmail(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Klantenbeheer</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalActive} actieve klanten · {totalLeads} leads/prospecten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            <Plus size={15} />
            Klant uitnodigen
          </button>
          {/* View toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            {(['pipeline', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'pipeline' ? <LayoutGrid size={13} /> : <List size={13} />}
                {v === 'pipeline' ? 'Pipeline' : 'Lijst'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek klant, bedrijf of e-mail…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Pipeline view */}
      {view === 'pipeline' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => {
            const cards = byStage(stage.key);
            return (
              <div key={stage.key} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${stage.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wide ${stage.color}`}>{stage.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-30">
                  {cards.map((d) => (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 transition-all bg-white border shadow-sm border-slate-200 rounded-2xl hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex items-center justify-center text-xs font-bold text-white w-9 h-9 rounded-xl bg-blue-600 shrink-0">
                          {initials(d.profile?.full_name ?? null, d.profile?.email ?? '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-900">
                            {d.profile?.full_name ?? d.profile?.email ?? 'Onbekend'}
                          </p>
                          {d.profile?.company && (
                            <p className="flex items-center gap-1 text-xs truncate text-slate-400">
                              <Building2 size={10} />{d.profile.company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Packages */}
                      {(d.packages?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {d.packages!.slice(0, 2).map((p) => (
                            <span
                              key={p.id}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: p.package?.color ?? '#3b82f6' }}
                            >
                              {p.package?.name}
                            </span>
                          ))}
                          {(d.packages?.length ?? 0) > 2 && (
                            <span className="text-[10px] text-slate-400">+{d.packages!.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Stage mover */}
                      <div className="flex items-center justify-between">
                        <select
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value as DossierStatus)}
                          className="text-[10px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>{s.label}</option>
                          ))}
                        </select>
                        <Link
                          href={`/dashboard/klanten/${d.id}`}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Dossier <ArrowRight size={11} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}

                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-16 border-2 border-dashed rounded-xl border-slate-200">
                      <span className="text-xs text-slate-400">Geen klanten</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-400">Klant</th>
                <th className="hidden px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-400 md:table-cell">Bedrijf</th>
                <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-400">Status</th>
                <th className="hidden px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-400 lg:table-cell">Pakket</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-lg bg-blue-600 shrink-0">
                        {initials(d.profile?.full_name ?? null, d.profile?.email ?? '?')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{d.profile?.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{d.profile?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-slate-600">
                    {d.profile?.company ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[d.status]}`}>
                      {STAGES.find((s) => s.key === d.status)?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(d.packages ?? []).slice(0, 2).map((p) => (
                        <span key={p.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: p.package?.color ?? '#3b82f6' }}>
                          {p.package?.name}
                        </span>
                      ))}
                      {!d.packages?.length && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/klanten/${d.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Dossier <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Users size={24} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-sm text-slate-400">Geen klanten gevonden</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
