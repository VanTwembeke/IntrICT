'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, RefreshCw, Send, FileText, Save,
  Users, UserPlus, ChevronDown, ChevronUp, Package,
} from 'lucide-react';
import type { ClientDossier, Invoice } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  notes: string;
  quantity: number;
  unit_price: number;
  package_id?: string;
  showNotes: boolean;
}

interface AvailablePackage {
  id: string;
  name: string;
  price: number;
  color: string;
}

interface GuestClientData {
  name: string;
  email: string;
  company: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
}

type SaveAction = 'draft' | 'create' | 'create_send';

// ── Helpers ───────────────────────────────────────────────────────────────────

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: '', notes: '', quantity: 1, unit_price: 0, showNotes: false };
}

function fmt(n: number) {
  return `€${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function emptyGuest(): GuestClientData {
  return { name: '', email: '', company: '', vat_number: '', address: '', postal_code: '', city: '', phone: '' };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NieuweFactuurClient({
  dossiers,
  availablePackages,
  preselectedClientId,
  isCreditNote = false,
  linkedInvoice = null,
}: {
  dossiers: ClientDossier[];
  availablePackages: AvailablePackage[];
  preselectedClientId?: string;
  isCreditNote?: boolean;
  linkedInvoice?: Invoice | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<SaveAction | null>(null);
  const [error, setError] = useState('');

  // ── Client mode ───────────────────────────────────────────────────────────
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [dossierId, setDossierId] = useState(() => {
    if (linkedInvoice?.dossier_id) return linkedInvoice.dossier_id;
    return '';
  });
  const [guest, setGuest] = useState<GuestClientData>(emptyGuest());

  const selectedDossier = dossiers.find((d) => d.id === dossierId) ?? null;

  useEffect(() => {
    if (linkedInvoice?.dossier_id) {
      setDossierId(linkedInvoice.dossier_id);
      setClientMode('existing');
      return;
    }
    if (preselectedClientId) {
      const match = dossiers.find((d) => d.id === preselectedClientId);
      if (match) { setDossierId(match.id); setClientMode('existing'); }
    }
  }, [preselectedClientId, linkedInvoice, dossiers]);

  const setGuestField = (field: keyof GuestClientData, value: string) =>
    setGuest((prev) => ({ ...prev, [field]: value }));

  // ── Invoice fields ────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(() => addDays(today, 30));
  const [vatRate, setVatRate] = useState(21);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');

  // Auto-update due date when issue date changes (always +30 calendar days)
  useEffect(() => {
    setDueDate(addDays(issueDate, 30));
  }, [issueDate]);

  // ── Line items ────────────────────────────────────────────────────────────
  const [items, setItems] = useState<LineItem[]>(() => {
    if (linkedInvoice?.items?.length) {
      return linkedInvoice.items.map((it) => ({
        id: crypto.randomUUID(),
        description: it.description,
        notes: it.notes ?? '',
        quantity: it.quantity,
        unit_price: -(it.unit_price),  // negate for credit note
        package_id: it.package_id ?? undefined,
        showNotes: !!it.notes,
      }));
    }
    return [newItem()];
  });

  const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const addPackageItem = (pkg: AvailablePackage) =>
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: pkg.name, notes: '', quantity: 1, unit_price: pkg.price, package_id: pkg.id, showNotes: false },
    ]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal  = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total     = subtotal + vatAmount;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async (action: SaveAction) => {
    setError('');

    if (clientMode === 'existing' && !dossierId) {
      setError('Selecteer een bestaande klant.'); return;
    }
    if (clientMode === 'new' && !guest.name.trim() && !guest.email.trim()) {
      setError('Vul minstens de naam of het e-mailadres van de klant in.'); return;
    }
    if (items.every((it) => !it.description.trim())) {
      setError('Voeg minstens één regelpost toe.'); return;
    }

    setSaving(action);
    try {
      const status     = action === 'draft' ? 'draft' : 'sent';
      const send_email = action === 'create_send';

      const payload: Record<string, unknown> = {
        type:               isCreditNote ? 'credit_note' : 'invoice',
        linked_invoice_id:  linkedInvoice?.id ?? null,
        status,
        send_email,
        issue_date:         issueDate,
        due_date:           dueDate,
        vat_rate:           vatRate,
        notes:              notes || null,
        language,
        is_recurring:       isRecurring,
        recurring_interval: isRecurring ? recurringInterval : null,
        items: items
          .filter((it) => it.description.trim())
          .map((it) => ({
            description: it.description,
            notes:       it.notes || null,
            quantity:    it.quantity,
            unit_price:  it.unit_price,
            total:       it.quantity * it.unit_price,
            package_id:  it.package_id ?? null,
          })),
      };

      if (clientMode === 'existing') {
        payload.dossier_id = dossierId;
        payload.profile_id = selectedDossier?.profile_id ?? null;
      } else {
        payload.guest_name        = guest.name.trim()        || null;
        payload.guest_email       = guest.email.trim()       || null;
        payload.guest_company     = guest.company.trim()     || null;
        payload.guest_vat_number  = guest.vat_number.trim()  || null;
        payload.guest_address     = guest.address.trim()     || null;
        payload.guest_postal_code = guest.postal_code.trim() || null;
        payload.guest_city        = guest.city.trim()        || null;
        payload.guest_phone       = guest.phone.trim()       || null;
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Er is een fout opgetreden.');
        return;
      }

      const inv = await res.json();
      router.push(`/dashboard/facturen/${inv.id}`);
    } finally {
      setSaving(null);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 transition-all rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isCreditNote ? 'Nieuwe creditnota' : 'Nieuwe factuur'}
          </h1>
          <p className="text-sm text-slate-500">
            {isCreditNote
              ? linkedInvoice
                ? `Creditnota voor factuur ${linkedInvoice.invoice_number}`
                : 'Creditnota aanmaken'
              : 'Maak een factuur aan voor een bestaande of nieuwe klant'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-5 lg:col-span-2">
          {isCreditNote && linkedInvoice && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Creditnota voor {linkedInvoice.invoice_number}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Bedragen zijn automatisch negatief gemaakt. Pas aan indien nodig.
                </p>
              </div>
            </div>
          )}

          {isCreditNote && !linkedInvoice && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              <FileText size={13} className="text-slate-400 shrink-0" />
              Creditnota — gebruik negatieve bedragen per lijn.
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">{error}</div>
          )}

          {/* ── Client card ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Klant</h2>
              <div className="inline-flex items-center gap-0.5 px-1 py-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    clientMode === 'existing' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Users size={11} />
                  Bestaande klant
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    clientMode === 'new' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserPlus size={11} />
                  Nieuwe klant
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {clientMode === 'existing' ? (
                <motion.div
                  key="existing"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <select
                    value={dossierId}
                    onChange={(e) => setDossierId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Selecteer klant —</option>
                    {dossiers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.profile?.full_name ?? d.guest_name ?? d.profile?.email ?? d.guest_email ?? d.id}
                        {(d.profile?.company ?? d.guest_company) ? ` (${d.profile?.company ?? d.guest_company})` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedDossier && (
                    <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-0.5">
                      {(selectedDossier.profile?.company ?? selectedDossier.guest_company) && (
                        <p className="font-semibold">{selectedDossier.profile?.company ?? selectedDossier.guest_company}</p>
                      )}
                      <p>{selectedDossier.profile?.full_name ?? selectedDossier.guest_name}</p>
                      <p className="text-slate-400">{selectedDossier.profile?.email ?? selectedDossier.guest_email}</p>
                      {selectedDossier.profile?.vat_number && (
                        <p className="text-slate-400">BTW: {selectedDossier.profile.vat_number}</p>
                      )}
                      {selectedDossier.profile?.address && (
                        <p className="text-slate-400">
                          {selectedDossier.profile.address}, {selectedDossier.profile.postal_code} {selectedDossier.profile.city}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-start gap-2 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl">
                    <UserPlus size={13} className="mt-0.5 shrink-0" />
                    <span>
                      Het systeem controleert automatisch of deze klant al bestaat op basis van e-mail of BTW-nummer.
                      Zo niet, wordt er automatisch een nieuw klantdossier aangemaakt.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {([
                      { field: 'name'        as const, label: 'Naam',         required: true,  placeholder: 'Jan Janssen',        type: 'text'  },
                      { field: 'email'       as const, label: 'E-mailadres',  required: false, placeholder: 'jan@bedrijf.be',     type: 'email' },
                      { field: 'company'     as const, label: 'Bedrijfsnaam', required: false, placeholder: 'Bedrijf BV',         type: 'text'  },
                      { field: 'vat_number'  as const, label: 'BTW-nummer',   required: false, placeholder: 'BE 0000.000.000',    type: 'text'  },
                      { field: 'phone'       as const, label: 'Telefoon',     required: false, placeholder: '+32 470 00 00 00',   type: 'tel'   },
                      { field: 'address'     as const, label: 'Adres',        required: false, placeholder: 'Straat 1',           type: 'text'  },
                    ]).map(({ field, label, required, placeholder, type }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                          {label} {required && <span className="text-red-400">*</span>}
                        </label>
                        <input
                          type={type}
                          value={guest[field]}
                          onChange={(e) => setGuestField(field, e.target.value)}
                          placeholder={placeholder}
                          className={inputClass}
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Postcode</label>
                        <input
                          type="text"
                          value={guest.postal_code}
                          onChange={(e) => setGuestField('postal_code', e.target.value)}
                          placeholder="9000"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Gemeente</label>
                        <input
                          type="text"
                          value={guest.city}
                          onChange={(e) => setGuestField('city', e.target.value)}
                          placeholder="Gent"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Factuurgegevens ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <h2 className="font-bold text-slate-900">Factuurgegevens</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Factuurdatum</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Vervaldatum
                  <span className="ml-1 font-normal text-slate-400">(+30 dagen)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">BTW %</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className={`${inputClass} bg-white`}
                >
                  <option value={0}>0% (vrijgesteld)</option>
                  <option value={6}>6%</option>
                  <option value={12}>12%</option>
                  <option value={21}>21%</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Taal PDF</label>
              <div className="inline-flex items-center gap-0.5 px-1 py-1 bg-slate-100 rounded-xl">
                {(['nl', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      language === l ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {!isCreditNote && (
              <>
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsRecurring((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                      isRecurring ? 'bg-purple-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                      isRecurring ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`} />
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-slate-700">
                    <RefreshCw size={14} className="text-purple-500" />
                    Terugkerende factuur
                  </span>
                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <select
                          value={recurringInterval}
                          onChange={(e) => setRecurringInterval(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                          className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white text-slate-700"
                        >
                          <option value="monthly">Maandelijks</option>
                          <option value="quarterly">Per kwartaal</option>
                          <option value="yearly">Jaarlijks</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {isRecurring && (
                  <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                    De eerste factuur wordt direct aangemaakt. Volgende facturen worden automatisch gegenereerd op basis van het gekozen interval.
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Regelposten ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <h2 className="font-bold text-slate-900">Regelposten</h2>

            {clientMode === 'existing' && selectedDossier && availablePackages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availablePackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => addPackageItem(pkg)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: pkg.color ?? '#3b82f6' }}
                  >
                    <Package size={10} />
                    {pkg.name} — {fmt(pkg.price)}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <div className="col-span-6 text-xs font-semibold text-slate-400">Omschrijving</div>
                <div className="col-span-2 text-xs font-semibold text-slate-400 text-center">Aantal</div>
                <div className="col-span-3 text-xs font-semibold text-slate-400">Prijs (excl.)</div>
                <div className="col-span-1" />
              </div>

              {items.map((item) => (
                <div key={item.id} className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="grid items-center grid-cols-12 gap-2">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Dienst of product…"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, 'showNotes', !item.showNotes)}
                        title={item.showNotes ? 'Verberg detail' : 'Voeg detail toe'}
                        className={`p-1.5 rounded-lg transition-all ${item.showNotes || item.notes ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                      >
                        {item.showNotes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Total for this line */}
                  <div className="text-right text-xs font-semibold text-slate-500 pr-1">
                    {fmt(item.quantity * item.unit_price)}
                  </div>

                  {/* Expandable notes / detail field */}
                  <AnimatePresence>
                    {(item.showNotes || item.notes) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                          placeholder="Detail, serienummer, referentie… (optioneel)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-600 placeholder:text-slate-300 mt-1"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newItem()])}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <Plus size={15} />
              Regelpost toevoegen
            </button>
          </div>

          {/* ── Opmerkingen ── */}
          <div className="p-5 space-y-3 bg-white border shadow-sm rounded-2xl border-slate-200">
            <h2 className="font-bold text-slate-900">Opmerkingen</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Betalingsvoorwaarden, referentie, …"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* ── Sidebar: totals + actions ── */}
        <div className="space-y-5">
          <div className="sticky p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200 top-6">
            <h2 className="font-bold text-slate-900">Totaal</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotaal</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>BTW ({vatRate}%)</span>
                <span className="font-medium">{fmt(vatAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold border-t text-slate-900 border-slate-100">
                <span>Totaal</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <div className="pt-1 space-y-2 border-t border-slate-100">
              {/* Aanmaken & verzenden */}
              <button
                onClick={() => handleSave('create_send')}
                disabled={saving !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                <Send size={14} />
                {saving === 'create_send'
                  ? 'Verzenden…'
                  : isCreditNote ? 'Creditnota & verzenden' : 'Aanmaken & verzenden'}
              </button>

              {/* Aanmaken (zonder e-mail) */}
              <button
                onClick={() => handleSave('create')}
                disabled={saving !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors text-sm disabled:opacity-50"
              >
                <FileText size={14} />
                {saving === 'create'
                  ? 'Aanmaken…'
                  : isCreditNote ? 'Creditnota aanmaken' : 'Aanmaken'}
              </button>

              {/* Concept */}
              <button
                onClick={() => handleSave('draft')}
                disabled={saving !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={14} />
                {saving === 'draft' ? 'Opslaan…' : 'Concept'}
              </button>
            </div>

            {/* Legenda */}
            <div className="space-y-1 pt-1 text-xs text-slate-400">
              <p><span className="font-semibold text-slate-600">Concept</span> — opgeslagen, nog niet definitief</p>
              <p><span className="font-semibold text-slate-600">{isCreditNote ? 'Creditnota aanmaken' : 'Aanmaken'}</span> — definitief, klant ontvangt geen e-mail</p>
              <p><span className="font-semibold text-slate-600">{isCreditNote ? 'Creditnota & verzenden' : 'Aanmaken & verzenden'}</span> — definitief + PDF per e-mail</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
