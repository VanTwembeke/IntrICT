'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Globe, Server, AtSign, MoreHorizontal, CheckCircle2,
  XCircle, FileText, Receipt, RefreshCw, AlertTriangle, Copy, Check,
  ExternalLink,
} from 'lucide-react';
import type { Contract, Invoice, ContractServiceType, InvoiceStatus } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<ContractServiceType, string> = {
  website: 'Website Overname',
  hosting: 'Hosting',
  domain:  'Domeinnaam',
  other:   'Andere',
};

const SERVICE_ICONS: Record<ContractServiceType, React.ReactNode> = {
  website: <Globe size={16} />,
  hosting: <Server size={16} />,
  domain:  <AtSign size={16} />,
  other:   <MoreHorizontal size={16} />,
};

const SERVICE_COLORS: Record<ContractServiceType, string> = {
  website: 'bg-blue-100 text-blue-700',
  hosting: 'bg-purple-100 text-purple-700',
  domain:  'bg-amber-100 text-amber-700',
  other:   'bg-slate-100 text-slate-600',
};

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:     'Concept',
  sent:      'Verstuurd',
  paid:      'Betaald',
  overdue:   'Achterstallig',
  cancelled: 'Geannuleerd',
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft:     'bg-slate-100 text-slate-600',
  sent:      'bg-blue-50 text-blue-700',
  paid:      'bg-green-50 text-green-700',
  overdue:   'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtEuro(n: number) {
  return `€\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function clientDisplayName(c: Contract): string {
  return c.profile?.full_name ?? c.guest_name ?? c.profile?.email ?? c.guest_email ?? '—';
}

// ── Cancel modal ──────────────────────────────────────────────────────────────

function CancelModal({
  contract,
  onClose,
  onCancelled,
}: {
  contract: Contract;
  onClose: () => void;
  onCancelled: (updated: Contract) => void;
}) {
  const [reason, setReason]   = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleCancel = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:              'cancelled',
          cancellation_date:   date,
          cancellation_reason: reason.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Er is een fout opgetreden.');
        return;
      }
      const updated = await res.json();
      onCancelled(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Contract opzeggen</h3>
            <p className="text-sm text-slate-500">{contract.contract_number}</p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Opzegdatum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reden (optioneel)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Reden voor opzegging…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 text-slate-800 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          Na opzegging worden geen nieuwe facturen meer gegenereerd. Openstaande facturen blijven verschuldigd.
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Opzeggen…' : 'Contract opzeggen'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContractDetail({
  contract: initialContract,
  linkedInvoices,
}: {
  contract: Contract;
  linkedInvoices: Invoice[];
}) {
  const router = useRouter();
  const [contract, setContract]     = useState<Contract>(initialContract);
  const [showCancel, setShowCancel] = useState(false);
  const [showText, setShowText]     = useState(false);
  const [copied, setCopied]         = useState(false);

  const isActive = contract.status === 'active';
  const vatAmount = contract.monthly_price_excl_vat * (contract.vat_rate / 100);
  const totalMonthly = contract.monthly_price_excl_vat + vatAmount;

  const handleCopyText = async () => {
    if (!contract.contract_text) return;
    await navigator.clipboard.writeText(contract.contract_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter invoices to show only those related to this contract
  // (all invoices for this dossier/profile, sorted by date)
  const invoices = linkedInvoices.filter((inv) => !inv.is_recurring || inv.id === contract.recurring_invoice_id);

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/dashboard/contracten')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all mt-0.5"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{contract.contract_number}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SERVICE_COLORS[contract.service_type]}`}>
                {SERVICE_ICONS[contract.service_type]}
                {SERVICE_LABELS[contract.service_type]}
              </span>
              {isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle2 size={11} /> Actief
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                  <XCircle size={11} /> Opgezegd
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Aangemaakt op {fmtDateShort(contract.created_at)}
            </p>
          </div>
          {isActive && (
            <button
              onClick={() => setShowCancel(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              <XCircle size={14} />
              Opzeggen
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Main column ── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Cancellation notice */}
            {!isActive && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Contract opgezegd</p>
                  {contract.cancellation_date && (
                    <p className="text-xs mt-0.5">Opzegdatum: {fmtDate(contract.cancellation_date)}</p>
                  )}
                  {contract.cancellation_reason && (
                    <p className="text-xs mt-0.5">Reden: {contract.cancellation_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Client info */}
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
              <h2 className="font-bold text-slate-900">Klantgegevens</h2>
              <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-0.5">
                {(contract.profile?.company ?? contract.guest_company) && (
                  <p className="font-semibold text-slate-800">{contract.profile?.company ?? contract.guest_company}</p>
                )}
                <p>{clientDisplayName(contract)}</p>
                {(contract.profile?.email ?? contract.guest_email) && (
                  <p className="text-slate-400">{contract.profile?.email ?? contract.guest_email}</p>
                )}
                {(contract.profile?.vat_number ?? contract.guest_vat_number) && (
                  <p className="text-slate-400">BTW: {contract.profile?.vat_number ?? contract.guest_vat_number}</p>
                )}
                {(contract.profile?.address ?? contract.guest_address) && (
                  <p className="text-slate-400">
                    {contract.profile?.address ?? contract.guest_address},{' '}
                    {(contract.profile?.postal_code ?? contract.guest_postal_code)}{' '}
                    {contract.profile?.city ?? contract.guest_city}
                  </p>
                )}
              </div>
              {contract.dossier_id && (
                <Link
                  href={`/dashboard/klanten/${contract.dossier_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink size={12} />
                  Klantdossier bekijken
                </Link>
              )}
            </div>

            {/* Service info */}
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
              <h2 className="font-bold text-slate-900">Dienst</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{contract.service_description}</p>
            </div>

            {/* Invoices */}
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Facturen</h2>
                <Link
                  href={`/dashboard/facturen`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Alle facturen
                </Link>
              </div>

              {linkedInvoices.length === 0 ? (
                <div className="py-6 text-center">
                  <Receipt size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    {isActive
                      ? `Eerste factuur wordt aangemaakt op ${fmtDateShort(contract.first_invoice_date)}.`
                      : 'Geen facturen gevonden.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {linkedInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/dashboard/facturen/${inv.id}`}
                      className="flex items-center justify-between py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{inv.invoice_number}</p>
                          {inv.is_recurring && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                              <RefreshCw size={10} />
                              Template
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{fmtDateShort(inv.issue_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${INVOICE_STATUS_COLORS[inv.status]}`}>
                          {INVOICE_STATUS_LABELS[inv.status]}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{fmtEuro(inv.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Contract text */}
            {contract.contract_text && (
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Contractdocument</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      {copied ? 'Gekopieerd' : 'Kopiëren'}
                    </button>
                    <button
                      onClick={() => setShowText((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      <FileText size={12} />
                      {showText ? 'Verbergen' : 'Tonen'}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {showText && (
                    <motion.pre
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto"
                    >
                      {contract.contract_text}
                    </motion.pre>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
              <h2 className="font-bold text-slate-900">Factuurgegevens</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Excl. BTW</span>
                  <span className="font-semibold text-slate-900">{fmtEuro(contract.monthly_price_excl_vat)}/mnd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BTW {contract.vat_rate}%</span>
                  <span className="font-medium text-slate-700">{fmtEuro(vatAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                  <span>Totaal/mnd</span>
                  <span>{fmtEuro(totalMonthly)}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
              <h2 className="font-bold text-slate-900">Looptijd</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Startdatum</span>
                  <span className="font-medium text-slate-700 text-right">{fmtDateShort(contract.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Eerste factuur</span>
                  <span className="font-medium text-slate-700 text-right">{fmtDateShort(contract.first_invoice_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verlenging</span>
                  <span className="font-medium text-slate-700">Jaarlijks, stilzwijgend</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Opzegtermijn</span>
                  <span className="font-medium text-slate-700">
                    {contract.notice_period_months} {contract.notice_period_months === 1 ? 'maand' : 'maanden'}
                  </span>
                </div>
                {!isActive && contract.cancellation_date && (
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-red-500 font-medium">Opgezegd op</span>
                    <span className="font-medium text-red-600">{fmtDateShort(contract.cancellation_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {contract.notes && (
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-2">
                <h2 className="font-bold text-slate-900">Bijzondere bepalingen</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{contract.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancel && (
          <CancelModal
            contract={contract}
            onClose={() => setShowCancel(false)}
            onCancelled={(updated) => {
              setContract(updated);
              setShowCancel(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
