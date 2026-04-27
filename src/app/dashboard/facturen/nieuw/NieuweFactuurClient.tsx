'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, RefreshCw, Save, Eye, EyeOff, Package,
  Users, UserPlus,
} from 'lucide-react';
import type { ClientDossier } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  package_id?: string;
}

interface AvailablePackage {
  id: string;
  name: string;
  price: number;
  color: string;
}

/** Manual client data entered by the admin for a new/unknown client. */
interface GuestClientData {
  name: string;
  email: string;
  company: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0 };
}

function fmt(n: number) {
  return `€${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function emptyGuest(): GuestClientData {
  return { name: '', email: '', company: '', vat_number: '', address: '', postal_code: '', city: '' };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NieuweFactuurClient({
  dossiers,
  availablePackages,
  preselectedClientId,
}: {
  dossiers: ClientDossier[];
  availablePackages: AvailablePackage[];
  preselectedClientId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Client mode ───────────────────────────────────────────────────────────
  /** 'existing' = select from dossier list; 'new' = manually fill in client data */
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [dossierId, setDossierId] = useState('');
  const [guest, setGuest] = useState<GuestClientData>(emptyGuest());

  const selectedDossier = dossiers.find((d) => d.id === dossierId) ?? null;

  // Pre-select if navigating from a dossier page
  useEffect(() => {
    if (preselectedClientId) {
      const match = dossiers.find((d) => d.id === preselectedClientId);
      if (match) { setDossierId(match.id); setClientMode('existing'); }
    }
  }, [preselectedClientId, dossiers]);

  const setGuestField = (field: keyof GuestClientData, value: string) =>
    setGuest((prev) => ({ ...prev, [field]: value }));

  // ── Invoice fields ────────────────────────────────────────────────────────
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vatRate, setVatRate] = useState(21);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [language, setLanguage] = useState<'nl' | 'en'>('nl');
  const [showPreview, setShowPreview] = useState(false);

  // ── Line items ────────────────────────────────────────────────────────────
  const [items, setItems] = useState<LineItem[]>([newItem()]);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const addPackageItem = (pkg: AvailablePackage) =>
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: pkg.name, quantity: 1, unit_price: pkg.price, package_id: pkg.id },
    ]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal  = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total     = subtotal + vatAmount;

  // ── Derived display values for the preview ────────────────────────────────
  const previewName    = clientMode === 'existing'
    ? (selectedDossier?.profile?.full_name ?? selectedDossier?.guest_name ?? '')
    : guest.name;
  const previewCompany = clientMode === 'existing'
    ? (selectedDossier?.profile?.company ?? selectedDossier?.guest_company ?? '')
    : guest.company;
  const previewEmail   = clientMode === 'existing'
    ? (selectedDossier?.profile?.email ?? selectedDossier?.guest_email ?? '')
    : guest.email;
  const previewVat     = clientMode === 'existing'
    ? (selectedDossier?.profile?.vat_number ?? '')
    : guest.vat_number;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async (status: 'draft' | 'sent') => {
    setError('');

    // Validation
    if (clientMode === 'existing' && !dossierId) {
      setError('Selecteer een bestaande klant.'); return;
    }
    if (clientMode === 'new' && !guest.name.trim() && !guest.email.trim()) {
      setError('Vul minstens de naam of het e-mailadres van de klant in.'); return;
    }
    if (items.every((it) => !it.description.trim())) {
      setError('Voeg minstens één regelpost toe.'); return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        status,
        issue_date:         issueDate,
        due_date:           dueDate || null,
        vat_rate:           vatRate,
        notes:              notes || null,
        language,
        is_recurring:       isRecurring,
        recurring_interval: isRecurring ? recurringInterval : null,
        items: items
          .filter((it) => it.description.trim())
          .map((it) => ({
            description: it.description,
            quantity:    it.quantity,
            unit_price:  it.unit_price,
            total:       it.quantity * it.unit_price,
            package_id:  it.package_id ?? null,
          })),
      };

      if (clientMode === 'existing') {
        // Link to existing dossier + profile
        payload.dossier_id = dossierId;
        payload.profile_id = selectedDossier?.profile_id ?? null;
      } else {
        // Send guest data — the API handles deduplication & dossier creation
        payload.guest_name        = guest.name.trim()        || null;
        payload.guest_email       = guest.email.trim()       || null;
        payload.guest_company     = guest.company.trim()     || null;
        payload.guest_vat_number  = guest.vat_number.trim()  || null;
        payload.guest_address     = guest.address.trim()     || null;
        payload.guest_postal_code = guest.postal_code.trim() || null;
        payload.guest_city        = guest.city.trim()        || null;
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
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Nieuwe factuur</h1>
          <p className="text-sm text-slate-500">Maak een factuur aan voor een bestaande of nieuwe klant</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? 'Verberg preview' : 'Toon preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-5 lg:col-span-2">
          {error && (
            <div className="p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">{error}</div>
          )}

          {/* ── Client card ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Klant</h2>
              {/* Toggle: existing vs new */}
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
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <select
                    value={dossierId}
                    onChange={(e) => setDossierId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
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
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {/* Info banner */}
                  <div className="flex items-start gap-2 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl">
                    <UserPlus size={13} className="mt-0.5 shrink-0" />
                    <span>
                      Het systeem controleert automatisch of deze klant al bestaat op basis van e-mail of BTW-nummer.
                      Zo niet, wordt er automatisch een nieuw klantdossier aangemaakt.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                        Naam <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => setGuestField('name', e.target.value)}
                        placeholder="Jan Janssen"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mailadres</label>
                      <input
                        type="email"
                        value={guest.email}
                        onChange={(e) => setGuestField('email', e.target.value)}
                        placeholder="jan@bedrijf.be"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bedrijfsnaam</label>
                      <input
                        type="text"
                        value={guest.company}
                        onChange={(e) => setGuestField('company', e.target.value)}
                        placeholder="Bedrijf BV (optioneel)"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">BTW-nummer</label>
                      <input
                        type="text"
                        value={guest.vat_number}
                        onChange={(e) => setGuestField('vat_number', e.target.value)}
                        placeholder="BE 0000.000.000"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Adres</label>
                      <input
                        type="text"
                        value={guest.address}
                        onChange={(e) => setGuestField('address', e.target.value)}
                        placeholder="Straat 1"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Postcode</label>
                        <input
                          type="text"
                          value={guest.postal_code}
                          onChange={(e) => setGuestField('postal_code', e.target.value)}
                          placeholder="9000"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Gemeente</label>
                        <input
                          type="text"
                          value={guest.city}
                          onChange={(e) => setGuestField('city', e.target.value)}
                          placeholder="Gent"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Dates, VAT, language, recurring ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <h2 className="font-bold text-slate-900">Factuurgegevens</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Factuurdatum</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vervaldatum</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">BTW %</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                >
                  <option value={0}>0% (vrijgesteld)</option>
                  <option value={6}>6%</option>
                  <option value={12}>12%</option>
                  <option value={21}>21%</option>
                </select>
              </div>
            </div>

            {/* Language */}
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

            {/* Recurring toggle */}
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
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
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
          </div>

          {/* ── Line items ── */}
          <div className="p-5 space-y-4 bg-white border shadow-sm rounded-2xl border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Regelposten</h2>
            </div>

            {/* Package quick-add (only when an existing client is selected) */}
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

            {/* Items */}
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={item.id} className="grid items-center grid-cols-12 gap-2">
                  <div className="col-span-6">
                    {i === 0 && <label className="block mb-1 text-xs font-semibold text-slate-400">Omschrijving</label>}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Dienst of product…"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="block mb-1 text-xs font-semibold text-slate-400">Aantal</label>}
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm text-center border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                    />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block mb-1 text-xs font-semibold text-slate-400">Eenheidsprijs</label>}
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                    />
                  </div>
                  <div className="col-span-1 flex items-end justify-center pb-0.5">
                    {i === 0 && <div className="h-5.5" />}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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

          {/* ── Notes ── */}
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
          <div className="sticky p-5 space-y-3 bg-white border shadow-sm rounded-2xl border-slate-200 top-6">
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

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleSave('sent')}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Opslaan…' : 'Opslaan & verzenden'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm disabled:opacity-50"
              >
                Concept opslaan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-2xl p-8 bg-white border shadow-sm rounded-2xl border-slate-200"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">FACTUUR</h2>
                <p className="mt-1 text-sm text-slate-400">Datum: {new Date(issueDate).toLocaleDateString('nl-BE')}</p>
                {dueDate && <p className="text-sm text-slate-400">Vervaldatum: {new Date(dueDate).toLocaleDateString('nl-BE')}</p>}
                {isRecurring && (
                  <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                    <RefreshCw size={10} />
                    Terugkerend — {recurringInterval === 'monthly' ? 'maandelijks' : recurringInterval === 'quarterly' ? 'per kwartaal' : 'jaarlijks'}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">IntrICT</p>
                <p className="text-xs text-slate-400">info@intrict.com</p>
              </div>
            </div>

            {(previewName || previewCompany || previewEmail) && (
              <div className="p-4 mb-6 text-sm bg-slate-50 rounded-xl">
                <p className="mb-1 font-semibold text-slate-800">Aan:</p>
                {previewCompany && <p className="font-medium">{previewCompany}</p>}
                {previewName    && <p>{previewName}</p>}
                {previewEmail   && <p className="text-slate-500">{previewEmail}</p>}
                {previewVat     && <p className="text-slate-500">BTW: {previewVat}</p>}
              </div>
            )}

            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-xs font-semibold text-left uppercase text-slate-400">Omschrijving</th>
                  <th className="py-2 text-xs font-semibold text-right uppercase text-slate-400">Aantal</th>
                  <th className="py-2 text-xs font-semibold text-right uppercase text-slate-400">Prijs</th>
                  <th className="py-2 text-xs font-semibold text-right uppercase text-slate-400">Totaal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.filter((it) => it.description.trim()).map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5 text-slate-700">{it.description}</td>
                    <td className="py-2.5 text-right text-slate-600">{it.quantity}</td>
                    <td className="py-2.5 text-right text-slate-600">{fmt(it.unit_price)}</td>
                    <td className="py-2.5 text-right font-medium text-slate-800">{fmt(it.quantity * it.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotaal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>BTW {vatRate}%</span><span>{fmt(vatAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold border-t text-slate-900 border-slate-200">
                <span>TOTAAL</span><span>{fmt(total)}</span>
              </div>
            </div>

            {notes && (
              <div className="pt-4 mt-6 text-sm border-t border-slate-100 text-slate-500">
                <p className="mb-1 font-semibold text-slate-700">Opmerkingen</p>
                <p>{notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
