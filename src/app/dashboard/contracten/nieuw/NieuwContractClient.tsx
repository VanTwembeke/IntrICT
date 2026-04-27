'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Users, UserPlus, Globe, Server, AtSign,
  MoreHorizontal, Eye, EyeOff, FileText, RefreshCw, AlertCircle,
} from 'lucide-react';
import type { ClientDossier, ContractServiceType } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GuestClientData {
  name: string;
  email: string;
  company: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS: Array<{
  type: ContractServiceType;
  label: string;
  icon: React.ReactNode;
  color: string;
  defaultDescription: string;
}> = [
  {
    type: 'website',
    label: 'Website Overname',
    icon: <Globe size={16} />,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    defaultDescription: 'Overname van het volledig beheer, hosting en onderhoud van de website inclusief CMS, bestanden en database.',
  },
  {
    type: 'hosting',
    label: 'Hosting',
    icon: <Server size={16} />,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    defaultDescription: 'Hostingbeheer inclusief serverruimte, SSL-certificaat, automatische back-ups en technisch beheer.',
  },
  {
    type: 'domain',
    label: 'Domeinnaam',
    icon: <AtSign size={16} />,
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    defaultDescription: 'Beheer en verlenging van de domeinnaam inclusief DNS-beheer en domeinregistratie.',
  },
  {
    type: 'other',
    label: 'Andere dienst',
    icon: <MoreHorizontal size={16} />,
    color: 'bg-slate-50 border-slate-200 text-slate-600',
    defaultDescription: '',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyGuest(): GuestClientData {
  return { name: '', email: '', company: '', vat_number: '', address: '', postal_code: '', city: '' };
}

function firstOfNextMonth(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtEuro(n: number) {
  return `€\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NieuwContractClient({ dossiers }: { dossiers: ClientDossier[] }) {
  const router = useRouter();
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // ── Client mode ───────────────────────────────────────────────────────────
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [dossierId, setDossierId]   = useState('');
  const [guest, setGuest]           = useState<GuestClientData>(emptyGuest());

  const selectedDossier = dossiers.find((d) => d.id === dossierId) ?? null;

  const setGuestField = (field: keyof GuestClientData, value: string) =>
    setGuest((prev) => ({ ...prev, [field]: value }));

  // ── Service type ──────────────────────────────────────────────────────────
  const [serviceType, setServiceType] = useState<ContractServiceType>('website');
  const [serviceDescription, setServiceDescription] = useState(SERVICE_OPTIONS[0].defaultDescription);

  // Update default description when service type changes
  useEffect(() => {
    const opt = SERVICE_OPTIONS.find((o) => o.type === serviceType);
    if (opt?.defaultDescription) setServiceDescription(opt.defaultDescription);
  }, [serviceType]);

  // ── Contract fields ───────────────────────────────────────────────────────
  const [monthlyPrice, setMonthlyPrice]         = useState<number>(0);
  const [vatRate, setVatRate]                   = useState<number>(21);
  const [startDate, setStartDate]               = useState(new Date().toISOString().split('T')[0]);
  const [noticePeriod, setNoticePeriod]         = useState<number>(3);
  const [notes, setNotes]                       = useState('');

  // ── Computed values ───────────────────────────────────────────────────────
  const vatAmount        = monthlyPrice * (vatRate / 100);
  const totalMonthly     = monthlyPrice + vatAmount;
  const firstInvoiceDate = firstOfNextMonth(startDate);

  // Preview client info
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

  const selectedServiceOption = SERVICE_OPTIONS.find((o) => o.type === serviceType)!;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError('');

    if (clientMode === 'existing' && !dossierId) {
      setError('Selecteer een bestaande klant.'); return;
    }
    if (clientMode === 'new' && !guest.name.trim() && !guest.email.trim()) {
      setError('Vul minstens de naam of het e-mailadres van de klant in.'); return;
    }
    if (!serviceDescription.trim()) {
      setError('Omschrijving van de dienst is verplicht.'); return;
    }
    if (!monthlyPrice || monthlyPrice <= 0) {
      setError('Maandelijkse prijs moet groter zijn dan 0.'); return;
    }
    if (!startDate) {
      setError('Startdatum is verplicht.'); return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        service_type:         serviceType,
        service_description:  serviceDescription.trim(),
        monthly_price_excl_vat: monthlyPrice,
        vat_rate:             vatRate,
        start_date:           startDate,
        notice_period_months: noticePeriod,
        notes:                notes.trim() || null,
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
      }

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Er is een fout opgetreden.');
        return;
      }

      const contract = await res.json();
      router.push(`/dashboard/contracten/${contract.id}`);
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
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nieuw contract</h1>
          <p className="text-sm text-slate-500">Overname overeenkomst aanmaken</p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? 'Verberg preview' : 'Toon contract preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Main form col ── */}
        <div className="space-y-5 lg:col-span-2">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-xl">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Client card ── */}
          <div className="p-5 space-y-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
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
                  <Users size={11} /> Bestaande klant
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    clientMode === 'new' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserPlus size={11} /> Nieuwe klant
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {clientMode === 'existing' ? (
                <motion.div key="existing" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="space-y-3">
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
                      {(selectedDossier.profile as { address?: string } | undefined)?.address && (
                        <p className="text-slate-400">
                          {(selectedDossier.profile as { address?: string; postal_code?: string; city?: string }).address},{' '}
                          {(selectedDossier.profile as { postal_code?: string }).postal_code}{' '}
                          {(selectedDossier.profile as { city?: string }).city}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="new" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }} className="space-y-3">
                  <div className="flex items-start gap-2 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl">
                    <UserPlus size={13} className="mt-0.5 shrink-0" />
                    <span>
                      Het systeem controleert automatisch of deze klant al bestaat op basis van e-mail of BTW-nummer. Een nieuw klantdossier wordt aangemaakt indien nodig.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { field: 'name' as const,        label: 'Naam *',        placeholder: 'Jan Janssen',         type: 'text' },
                      { field: 'email' as const,       label: 'E-mailadres',   placeholder: 'jan@bedrijf.be',      type: 'email' },
                      { field: 'company' as const,     label: 'Bedrijfsnaam',  placeholder: 'Bedrijf BV',          type: 'text' },
                      { field: 'vat_number' as const,  label: 'BTW-nummer',    placeholder: 'BE 0000.000.000',     type: 'text' },
                      { field: 'address' as const,     label: 'Adres',         placeholder: 'Straat 1',            type: 'text' },
                    ].map(({ field, label, placeholder, type }) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={guest[field]}
                          onChange={(e) => setGuestField(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300"
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

          {/* ── Service type ── */}
          <div className="p-5 space-y-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="font-bold text-slate-900">Type dienst</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SERVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setServiceType(opt.type)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    serviceType === opt.type
                      ? opt.color + ' shadow-sm ring-2 ring-current ring-opacity-30'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Omschrijving van de dienst <span className="text-red-400">*</span>
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={3}
                placeholder="Beschrijf de overgenomen dienst in detail…"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300 resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                Deze tekst verschijnt in het contract en op de factuuromschrijving.
              </p>
            </div>
          </div>

          {/* ── Pricing & dates ── */}
          <div className="p-5 space-y-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="font-bold text-slate-900">Prijzen & data</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Maandprijs (excl. BTW) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={monthlyPrice || ''}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                  />
                </div>
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
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Startdatum <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Opzegtermijn (maanden)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800"
                />
              </div>
            </div>

            {/* Billing info */}
            {startDate && (
              <div className="flex items-start gap-2 p-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-xl">
                <RefreshCw size={13} className="mt-0.5 shrink-0" />
                <span>
                  Eerste factuur op <strong>{fmtDate(firstInvoiceDate)}</strong>, daarna maandelijks terugkerend op de eerste van elke maand.
                </span>
              </div>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="p-5 space-y-3 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="font-bold text-slate-900">Bijzondere bepalingen (optioneel)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Aanvullende bepalingen die in het contract worden opgenomen…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* ── Sidebar: summary + action ── */}
        <div className="space-y-5">
          <div className="sticky top-6 p-5 space-y-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <h2 className="font-bold text-slate-900">Samenvatting</h2>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                {selectedServiceOption.icon}
                <span className="font-medium">{selectedServiceOption.label}</span>
              </div>
              <div className="pt-2 space-y-1.5 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Excl. BTW</span>
                  <span className="font-medium">{fmtEuro(monthlyPrice)}/mnd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BTW {vatRate}%</span>
                  <span className="font-medium">{fmtEuro(vatAmount)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-slate-900">
                  <span>Totaal/mnd</span>
                  <span>{fmtEuro(totalMonthly)}</span>
                </div>
              </div>
              {startDate && (
                <div className="pt-2 space-y-1 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Startdatum</span>
                    <span className="font-medium text-slate-700">{fmtDate(startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eerste factuur</span>
                    <span className="font-medium text-slate-700">{fmtDate(firstInvoiceDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opzegtermijn</span>
                    <span className="font-medium text-slate-700">{noticePeriod} {noticePeriod === 1 ? 'maand' : 'maanden'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Aanmaken…' : 'Contract aanmaken'}
              </button>
              <p className="text-center text-xs text-slate-400">
                Contract tekst wordt automatisch gegenereerd
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contract preview ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-400" />
              <h2 className="font-bold text-slate-900">Contract preview</h2>
              <span className="text-xs text-slate-400 ml-auto">Gegenereerde tekst — na opslaan beschikbaar als volledig document</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-200">
              {`OVEREENKOMST — ${selectedServiceOption.label.toUpperCase()}
Opgemaakt op ${fmtDate(startDate)}

ARTIKEL 1 — PARTIJEN

Dienstverlener: IntrICT

Klant:
  ${previewCompany ? previewCompany + '\n  ' : ''}${previewName || '(naam klant)'}${previewVat ? '\n  BTW: ' + previewVat : ''}${previewEmail ? '\n  ' + previewEmail : ''}

ARTIKEL 2 — VOORWERP
  ${serviceDescription || '(omschrijving dienst)'}

ARTIKEL 3 — DUUR EN VERLENGING
  Startdatum: ${fmtDate(startDate)}
  Stilzwijgend jaarlijks verlengd. Opzegtermijn: ${noticePeriod} ${noticePeriod === 1 ? 'maand' : 'maanden'}.

ARTIKEL 5 — BETALINGSVOORWAARDEN
  Maandelijkse vergoeding: ${fmtEuro(monthlyPrice)} excl. BTW / ${fmtEuro(totalMonthly)} incl. BTW ${vatRate}%
  Eerste factuurdatum: ${fmtDate(firstInvoiceDate)}
  Daarna maandelijks, betaalbaar binnen 30 dagen.

[… volledig contract beschikbaar na aanmaken]`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
