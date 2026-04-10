'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, FileText,
  RefreshCw, Download, Trash2, ChevronDown,
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  draft:     { label: 'Concept',     badge: 'bg-slate-100 text-slate-600',  icon: <FileText size={14} /> },
  sent:      { label: 'Verzonden',   badge: 'bg-blue-100 text-blue-700',    icon: <Clock size={14} /> },
  paid:      { label: 'Betaald',     badge: 'bg-green-100 text-green-700',  icon: <CheckCircle size={14} /> },
  overdue:   { label: 'Vervallen',   badge: 'bg-red-100 text-red-700',      icon: <AlertTriangle size={14} /> },
  cancelled: { label: 'Geannuleerd', badge: 'bg-slate-100 text-slate-400',  icon: <XCircle size={14} /> },
};

const NEXT_STATUSES: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft:     ['sent', 'cancelled'],
  sent:      ['paid', 'overdue', 'cancelled'],
  paid:      [],
  overdue:   ['paid', 'cancelled'],
  cancelled: [],
};

function fmt(n: number) {
  return `€ ${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function FactuurDetail({ invoice: initial }: { invoice: Invoice }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const cfg = STATUS_CONFIG[invoice.status];
  const nextStatuses = NEXT_STATUSES[invoice.status];

  const updateStatus = async (status: InvoiceStatus) => {
    setSaving(true);
    setStatusOpen(false);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice((prev) => ({ ...prev, status: data.status }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!res.ok) throw new Error('PDF generatie mislukt');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factuur-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Factuur permanent verwijderen?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
      router.push('/dashboard/facturen');
    } finally {
      setDeleting(false);
    }
  };

  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/dashboard/facturen"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h1>
            {invoice.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                <RefreshCw size={11} />
                {invoice.recurring_interval === 'monthly' ? 'Maandelijks' : invoice.recurring_interval === 'quarterly' ? 'Per kwartaal' : 'Jaarlijks'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {invoice.profile?.full_name ?? invoice.profile?.email ?? '—'}
            {invoice.profile?.company ? ` · ${invoice.profile.company}` : ''}
          </p>
        </div>

        {/* Status changer */}
        <div className="relative">
          <button
            onClick={() => nextStatuses.length > 0 && setStatusOpen((v) => !v)}
            disabled={saving || nextStatuses.length === 0}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${cfg.badge} ${
              nextStatuses.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
            }`}
          >
            {cfg.icon}{cfg.label}
            {nextStatuses.length > 0 && <ChevronDown size={14} className={statusOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />}
          </button>
          {statusOpen && nextStatuses.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[180px]">
                {nextStatuses.map((s) => {
                  const sc = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      {sc.icon} Markeer als {sc.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
        >
          <Download size={15} />
          {downloading ? 'Genereren…' : 'Download PDF'}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Verwijderen"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Invoice preview card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Blue top band */}
        <div className="h-1.5 bg-linear-to-r from-blue-600 to-indigo-600" />

        <div className="p-8 md:p-10">
          {/* Top: company vs client */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
            {/* IntrICT */}
            <div>
              <p className="text-2xl font-black text-blue-600 tracking-wide mb-1">IntrICT</p>
              <p className="text-xs text-slate-400">IT-diensten &amp; weboplossingen</p>
              <div className="mt-3 space-y-0.5 text-xs text-slate-500">
                <p>BTW: BE 0000.000.000</p>
                <p>info@intrict.be</p>
              </div>
            </div>

            {/* Invoice meta */}
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 mb-1">FACTUUR</p>
              <p className="text-sm font-bold text-blue-600">{invoice.invoice_number}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                {cfg.icon}{cfg.label}
              </span>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Dates */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Factuurgegevens</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28">Factuurdatum</span>
                <span className="text-sm font-semibold text-slate-700">
                  {fmtDate(invoice.issue_date ?? invoice.created_at)}
                </span>
              </div>
              {invoice.due_date && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28">Vervaldatum</span>
                  <span className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                    {fmtDate(invoice.due_date)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28">Mededeling</span>
                <span className="text-sm font-semibold text-slate-700">Factuur {invoice.invoice_number}</span>
              </div>
            </div>

            {/* Client */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Klant</p>
              <div className="text-sm text-slate-700 space-y-0.5">
                {invoice.profile?.company && (
                  <p className="font-bold text-slate-900">{invoice.profile.company}</p>
                )}
                <p className={invoice.profile?.company ? '' : 'font-bold text-slate-900'}>
                  {invoice.profile?.full_name}
                </p>
                <p className="text-slate-400 text-xs">{invoice.profile?.email}</p>
                {invoice.profile?.vat_number && (
                  <p className="text-slate-400 text-xs">BTW: {invoice.profile.vat_number}</p>
                )}
                {invoice.profile?.address && (
                  <p className="text-slate-400 text-xs">
                    {invoice.profile.address}, {invoice.profile.postal_code} {invoice.profile.city}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide">Omschrijving</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wide w-16">Aantal</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide w-28">Prijs (excl.)</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wide w-28">Totaal (excl.)</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items ?? []).map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-3 text-slate-800">{item.description}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{fmt(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {fmt(item.total ?? item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-slate-500 py-1 border-b border-slate-100">
                <span>Subtotaal (excl. BTW)</span>
                <span className="font-medium text-slate-700">{fmt(invoice.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 py-1 border-b border-slate-100">
                <span>BTW {invoice.vat_rate ?? 21}%</span>
                <span className="font-medium text-slate-700">{fmt(invoice.vat_amount ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl px-4 py-3 mt-2">
                <span className="font-bold">TOTAAL VERSCHULDIGD</span>
                <span className="text-xl font-black">{fmt(invoice.total ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">Betalingsinstructies</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-slate-400 w-24 shrink-0">Begunstigde</span>
                <span className="font-semibold text-slate-700">IntrICT BV</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-24 shrink-0">IBAN</span>
                <span className="font-semibold text-slate-700">BE00 0000 0000 0000</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-24 shrink-0">BIC</span>
                <span className="font-semibold text-slate-700">GEBABEBB</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 w-24 shrink-0">Mededeling</span>
                <span className="font-semibold text-slate-700">Factuur {invoice.invoice_number}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Gelieve te betalen binnen 30 dagen na factuurdatum. Bij laattijdige betaling is van rechtswege en zonder
              ingebrekestelling een verwijlintrest van 10% per jaar verschuldigd.
            </p>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Opmerkingen</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Legal footer */}
          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 flex flex-col sm:flex-row sm:justify-between gap-1">
            <span>IntrICT BV · BTW BE 0000.000.000 · KBO 0000.000.000</span>
            <a
              href="https://intrict.be/algemene-voorwaarden"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Algemene voorwaarden: intrict.be/algemene-voorwaarden
            </a>
          </div>
        </div>
      </div>

      {/* Back to dossier */}
      {invoice.dossier_id && (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/klanten/${invoice.dossier_id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Terug naar klantdossier →
          </Link>
        </div>
      )}
    </div>
  );
}
