'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Building2, Mail, Phone, Package, FileText,
  Clock, Plus, X, Save, CheckCircle, AlertCircle, Receipt,
} from 'lucide-react';
import type { ClientDossier, ActivityLog, Invoice, DossierStatus } from '@/lib/types';

const STAGES: { key: DossierStatus; label: string; color: string }[] = [
  { key: 'lead',      label: 'Lead',     color: 'bg-slate-100 text-slate-700' },
  { key: 'prospect',  label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
  { key: 'klant',     label: 'Klant',    color: 'bg-green-100 text-green-700' },
  { key: 'completed', label: 'Voltooid', color: 'bg-purple-100 text-purple-700' },
];

const INV_STATUS: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  sent:      'bg-blue-100 text-blue-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-400',
};

const ACT_ICON: Record<string, React.ReactNode> = {
  appointment_created: <Clock size={13} className="text-blue-500" />,
  package_request:     <Package size={13} className="text-green-500" />,
  invoice_created:     <Receipt size={13} className="text-purple-500" />,
  status_change:       <CheckCircle size={13} className="text-amber-500" />,
  message_sent:        <Mail size={13} className="text-slate-400" />,
};

export default function DossierClient({
  dossier: initial,
  activity: initialActivity,
  invoices: initialInvoices,
  availablePackages,
}: {
  dossier: ClientDossier;
  activity: ActivityLog[];
  invoices: Invoice[];
  availablePackages: { id: string; name: string; price: number; color: string }[];
}) {
  const router = useRouter();
  const [dossier, setDossier] = useState(initial);
  const [activity] = useState(initialActivity);
  const [invoices] = useState(initialInvoices);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState(dossier.notes ?? '');
  const [addPkg, setAddPkg] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [pkgSaving, setPkgSaving] = useState(false);

  const profile = dossier.profile;

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/dossiers/${dossier.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: dossier.status, notes }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const handleStatusChange = (status: DossierStatus) => {
    setDossier((d) => ({ ...d, status }));
  };

  const handleAddPackage = async () => {
    if (!selectedPkg) return;
    setPkgSaving(true);
    const res = await fetch(`/api/dossiers/${dossier.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_package', package_id: selectedPkg, is_recurring: isRecurring }),
    });
    if (res.ok) {
      const data = await res.json();
      setDossier((d) => ({ ...d, packages: [...(d.packages ?? []), data] }));
      setAddPkg(false);
      setSelectedPkg('');
    }
    setPkgSaving(false);
  };

  const handleRemovePackage = async (dpId: string) => {
    await fetch(`/api/dossiers/${dossier.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove_package', package_id: dpId }),
    });
    setDossier((d) => ({ ...d, packages: (d.packages ?? []).filter((p) => p.id !== dpId) }));
  };

  const totalInvoiced = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0);
  const totalPaid     = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back + header */}
      <div>
        <Link href="/dashboard/klanten" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={14} /> Terug naar klanten
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profile?.full_name ?? profile?.email ?? 'Klant'}
            </h1>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/facturen/nieuw?client=${dossier.profile_id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Nieuwe factuur
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saved ? 'Opgeslagen' : saving ? 'Bezig…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                {(profile?.full_name ?? profile?.email ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{profile?.full_name ?? '—'}</p>
                {profile?.customer_number && <p className="text-xs text-slate-400">#{profile.customer_number}</p>}
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={13} className="text-slate-400 shrink-0" />{profile?.email}
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={13} className="text-slate-400 shrink-0" />{profile.phone}
                </div>
              )}
              {profile?.company && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 size={13} className="text-slate-400 shrink-0" />{profile.company}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pipeline status</h3>
            <div className="space-y-1.5">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStatusChange(s.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                    dossier.status === s.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-transparent hover:border-slate-200 ' + s.color
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dossier.status === s.key ? 'bg-blue-500' : 'bg-current opacity-50'}`} />
                  {s.label}
                  {dossier.status === s.key && <CheckCircle size={13} className="ml-auto text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Financieel</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Gefactureerd</span>
                <span className="font-bold text-slate-900">€{totalInvoiced.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Betaald</span>
                <span className="font-bold text-green-600">€{totalPaid.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Openstaand</span>
                <span className="font-bold text-amber-600">€{(totalInvoiced - totalPaid).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Notities</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Voeg notities toe over deze klant…"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Packages */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Actieve pakketten</h3>
              <button
                onClick={() => setAddPkg(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={12} /> Toevoegen
              </button>
            </div>

            <AnimatePresence>
              {addPkg && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <select
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
                    >
                      <option value="">Selecteer pakket…</option>
                      {availablePackages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — €{p.price}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded" />
                      Terugkerend (maandelijks factureren)
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleAddPackage} disabled={!selectedPkg || pkgSaving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
                        {pkgSaving ? 'Bezig…' : 'Toevoegen'}
                      </button>
                      <button onClick={() => setAddPkg(false)}
                        className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                        Annuleren
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {(dossier.packages?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Geen pakketten gekoppeld.</p>
            ) : (
              <div className="space-y-2">
                {dossier.packages!.map((dp) => (
                  <div key={dp.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dp.package?.color ?? '#3b82f6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{dp.package?.name}</p>
                      <p className="text-xs text-slate-400">
                        €{dp.package?.price?.toLocaleString('nl-BE')}
                        {dp.is_recurring && ' · Terugkerend'}
                      </p>
                    </div>
                    <button onClick={() => handleRemovePackage(dp.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Facturen</h3>
              <Link href={`/dashboard/facturen/nieuw?client=${dossier.profile_id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <Plus size={12} /> Nieuwe factuur
              </Link>
            </div>
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Geen facturen voor deze klant.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Link key={inv.id} href={`/dashboard/facturen/${inv.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                    <FileText size={14} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400">{new Date(inv.issue_date).toLocaleDateString('nl-BE')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">€{inv.total.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${INV_STATUS[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Activiteit</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nog geen activiteit.</p>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-100" />
                {activity.map((a, i) => (
                  <div key={a.id} className="flex gap-3 pl-1 pb-4 last:pb-0">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shrink-0">
                      {ACT_ICON[a.type] ?? <Clock size={13} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(a.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
