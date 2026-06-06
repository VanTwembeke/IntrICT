'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, Mail, Phone, Package, FileText,
  Clock, Plus, X, Save, CheckCircle, AlertCircle, Receipt, Edit3,
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
  const [saveError, setSaveError] = useState('');
  const [notes, setNotes] = useState(dossier.notes ?? '');
  const [addPkg, setAddPkg] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [pkgSaving, setPkgSaving] = useState(false);
  const [pkgError, setPkgError] = useState('');
  const [lastAddedPkg, setLastAddedPkg] = useState<{ name: string } | null>(null);

  // Guest editable fields
  const [editGuest, setEditGuest] = useState(false);
  const [guestName,    setGuestName]    = useState(dossier.guest_name    ?? '');
  const [guestEmail,   setGuestEmail]   = useState(dossier.guest_email   ?? '');
  const [guestPhone,   setGuestPhone]   = useState(dossier.guest_phone   ?? '');
  const [guestCompany, setGuestCompany] = useState(dossier.guest_company ?? '');

  const profile = dossier.profile;
  const isGuest = !dossier.profile_id;

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const body: Record<string, unknown> = { status: dossier.status, notes };
    if (isGuest) {
      body.guest_name    = guestName.trim()    || null;
      body.guest_email   = guestEmail.trim()   || null;
      body.guest_phone   = guestPhone.trim()   || null;
      body.guest_company = guestCompany.trim() || null;
    }
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (isGuest) {
          setDossier((d) => ({
            ...d,
            guest_name:    guestName.trim()    || null,
            guest_email:   guestEmail.trim()   || null,
            guest_phone:   guestPhone.trim()   || null,
            guest_company: guestCompany.trim() || null,
          }));
          setEditGuest(false);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? 'Opslaan mislukt. Probeer opnieuw.');
      }
    } catch {
      setSaveError('Netwerkfout. Controleer je verbinding.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (status: DossierStatus) => {
    setDossier((d) => ({ ...d, status }));
  };

  const handleAddPackage = async () => {
    if (!selectedPkg) return;
    setPkgSaving(true);
    setPkgError('');
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_package', package_id: selectedPkg, is_recurring: isRecurring }),
      });
      if (res.ok) {
        const data = await res.json();
        setDossier((d) => ({ ...d, packages: [...(d.packages ?? []), data] }));
        setLastAddedPkg({ name: data.package?.name ?? 'Pakket' });
        setAddPkg(false);
        setSelectedPkg('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPkgError(data.error ?? 'Toevoegen mislukt.');
      }
    } catch {
      setPkgError('Netwerkfout. Probeer opnieuw.');
    } finally {
      setPkgSaving(false);
    }
  };

  const handleRemovePackage = async (dpId: string) => {
    setPkgError('');
    try {
      const res = await fetch(`/api/dossiers/${dossier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_package', package_id: dpId }),
      });
      if (res.ok) {
        setDossier((d) => ({ ...d, packages: (d.packages ?? []).filter((p) => p.id !== dpId) }));
      } else {
        const data = await res.json().catch(() => ({}));
        setPkgError(data.error ?? 'Verwijderen mislukt.');
      }
    } catch {
      setPkgError('Netwerkfout. Probeer opnieuw.');
    }
  };

  const totalInvoiced = invoices.filter((i) => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0);
  const totalPaid     = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="max-w-6xl space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/dashboard/klanten" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={14} /> Terug naar klanten
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profile?.full_name ?? dossier.guest_name ?? profile?.email ?? dossier.guest_email ?? 'Klant'}
            </h1>
            <p className="text-sm text-slate-500">
              {profile?.email ?? dossier.guest_email ?? (isGuest ? 'Gast · geen account' : '')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={dossier.profile_id
                  ? `/dashboard/facturen/nieuw?client=${dossier.profile_id}`
                  : `/dashboard/facturen/nieuw?dossier=${dossier.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
              >
                <Plus size={14} /> Nieuwe factuur
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-60"
              >
                {saved ? <CheckCircle size={14} /> : <Save size={14} />}
                {saved ? 'Opgeslagen' : saving ? 'Bezig…' : 'Opslaan'}
              </button>
            </div>
            {saveError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {saveError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-1">
          {/* Profile card */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-2xl bg-blue-600">
                {(profile?.full_name ?? dossier.guest_name ?? profile?.email ?? dossier.guest_email ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {profile?.full_name ?? dossier.guest_name ?? '—'}
                </p>
                {profile?.customer_number
                  ? <p className="text-xs text-slate-400">#{profile.customer_number}</p>
                  : isGuest && <p className="text-xs text-violet-500 font-semibold">Gast · geen account</p>
                }
              </div>
              {isGuest && (
                <button
                  onClick={() => setEditGuest((v) => !v)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Gegevens bewerken"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>

            {/* Guest: read view */}
            {isGuest && !editGuest && (
              <div className="space-y-2.5 text-sm">
                {dossier.guest_email ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={13} className="text-slate-400 shrink-0" />{dossier.guest_email}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Geen e-mail ingevuld</p>
                )}
                {dossier.guest_phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={13} className="text-slate-400 shrink-0" />{dossier.guest_phone}
                  </div>
                )}
                {dossier.guest_company && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 size={13} className="text-slate-400 shrink-0" />{dossier.guest_company}
                  </div>
                )}
                <button
                  onClick={() => setEditGuest(true)}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Gegevens aanvullen →
                </button>
              </div>
            )}

            {/* Guest: edit form */}
            {isGuest && editGuest && (
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Naam',     value: guestName,    set: setGuestName,    type: 'text',  placeholder: 'Jan Jansen' },
                  { label: 'E-mail',   value: guestEmail,   set: setGuestEmail,   type: 'email', placeholder: 'jan@bedrijf.be' },
                  { label: 'Telefoon', value: guestPhone,   set: setGuestPhone,   type: 'tel',   placeholder: '+32 …' },
                  { label: 'Bedrijf',  value: guestCompany, set: setGuestCompany, type: 'text',  placeholder: 'Bedrijfsnaam' },
                ].map(({ label, value, set, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                ))}
                <p className="text-[10px] text-slate-400">Klik op &ldquo;Opslaan&rdquo; hierboven om te bewaren.</p>
              </div>
            )}

            {/* Profile user: read view */}
            {!isGuest && (
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
            )}
          </div>

          {/* Status */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <h3 className="mb-3 text-xs font-bold tracking-widest uppercase text-slate-400">Pipeline status</h3>
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
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <h3 className="mb-3 text-xs font-bold tracking-widest uppercase text-slate-400">Financieel</h3>
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
        <div className="space-y-5 lg:col-span-2">
          {/* Notes */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <h3 className="mb-3 text-xs font-bold tracking-widest uppercase text-slate-400">Notities</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Voeg notities toe over deze klant…"
              className="w-full px-4 py-3 text-sm border resize-none border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Packages */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">Actieve pakketten</h3>
              <button
                onClick={() => setAddPkg(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <Plus size={12} /> Toevoegen
              </button>
            </div>

            {/* Factuur-prompt na pakket toevoegen */}
            <AnimatePresence>
              {lastAddedPkg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 flex items-center justify-between gap-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={14} />
                    <span><strong>{lastAddedPkg.name}</strong> toegevoegd.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={dossier.profile_id
                        ? `/dashboard/facturen/nieuw?client=${dossier.profile_id}`
                        : `/dashboard/facturen/nieuw?dossier=${dossier.id}`}
                      className="text-xs font-semibold text-green-700 hover:underline"
                    >
                      Factuur aanmaken →
                    </Link>
                    <button onClick={() => setLastAddedPkg(null)} className="text-green-400 hover:text-green-600">
                      <X size={13} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {addPkg && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="p-3 space-y-3 border bg-slate-50 rounded-xl border-slate-200">
                    <select
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
                    >
                      <option value="">Selecteer pakket…</option>
                      {availablePackages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — €{p.price}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-600">
                      <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded" />
                      Terugkerend (maandelijks factureren)
                    </label>
                    <div className="flex gap-2">
                      <button onClick={handleAddPackage} disabled={!selectedPkg || pkgSaving}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                        {pkgSaving ? 'Bezig…' : 'Toevoegen'}
                      </button>
                      <button onClick={() => { setAddPkg(false); setPkgError(''); }}
                        className="px-3 py-2 text-xs font-semibold transition-colors border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
                        Annuleren
                      </button>
                    </div>
                    {pkgError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} /> {pkgError}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pkgError && !addPkg && (
              <p className="mb-3 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={11} /> {pkgError}
              </p>
            )}

            {(dossier.packages?.length ?? 0) === 0 ? (
              <p className="py-4 text-sm text-center text-slate-400">Geen pakketten gekoppeld.</p>
            ) : (
              <div className="space-y-2">
                {dossier.packages!.map((dp) => (
                  <div key={dp.id} className="flex items-center gap-3 p-3 border rounded-xl border-slate-100 bg-slate-50">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dp.package?.color ?? '#3b82f6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{dp.package?.name}</p>
                      <p className="text-xs text-slate-400">
                        €{dp.package?.price?.toLocaleString('nl-BE')}
                        {dp.is_recurring && ' · Terugkerend'}
                      </p>
                    </div>
                    <button onClick={() => handleRemovePackage(dp.id)}
                      className="p-1 transition-colors rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">Facturen</h3>
              <Link
                href={dossier.profile_id
                  ? `/dashboard/facturen/nieuw?client=${dossier.profile_id}`
                  : `/dashboard/facturen/nieuw?dossier=${dossier.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <Plus size={12} /> Nieuwe factuur
              </Link>
            </div>
            {invoices.length === 0 ? (
              <p className="py-4 text-sm text-center text-slate-400">Geen facturen voor deze klant.</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <Link key={inv.id} href={`/dashboard/facturen/${inv.id}`}
                    className="flex items-center gap-3 p-3 transition-all border rounded-xl border-slate-100 hover:border-blue-200 hover:bg-blue-50 group">
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
          <div className="p-5 bg-white border shadow-sm border-slate-200 rounded-2xl">
            <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-slate-400">Activiteit</h3>
            {activity.length === 0 ? (
              <p className="py-4 text-sm text-center text-slate-400">Nog geen activiteit.</p>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-4.5 top-0 bottom-0 w-px bg-slate-100" />
                {activity.map((a, i) => (
                  <div key={a.id} className="flex gap-3 pb-4 pl-1 last:pb-0">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border rounded-full border-slate-200 shrink-0">
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
