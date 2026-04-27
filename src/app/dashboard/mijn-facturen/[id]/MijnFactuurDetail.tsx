'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, CheckCircle, Clock, AlertTriangle,
  XCircle, FileText, RefreshCw,
} from 'lucide-react';
import { COMPANY } from '@/lib/company';
import type { Invoice, InvoiceStatus } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  draft:     { label: 'Concept',     badge: 'bg-slate-100 text-slate-500',   icon: <FileText size={14} /> },
  sent:      { label: 'Openstaand',  badge: 'bg-blue-100 text-blue-700',     icon: <Clock size={14} /> },
  paid:      { label: 'Betaald',     badge: 'bg-green-100 text-green-700',   icon: <CheckCircle size={14} /> },
  overdue:   { label: 'Vervallen',   badge: 'bg-red-100 text-red-700',       icon: <AlertTriangle size={14} /> },
  cancelled: { label: 'Geannuleerd', badge: 'bg-slate-100 text-slate-400',   icon: <XCircle size={14} /> },
};

function fmt(n: number) {
  return `\u20ac\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MijnFactuurDetail({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const cfg    = STATUS_CONFIG[invoice.status];
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/mijn-facturen')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              {cfg.icon}{cfg.label}
            </span>
            {invoice.is_recurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                <RefreshCw size={10} /> Maandelijks
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">Factuurdatum: {fmtDate(invoice.issue_date)}</p>
        </div>
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Download size={14} />
          PDF
        </a>
      </div>

      {/* Overdue alert */}
      {isOverdue && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Deze factuur is vervallen. Neem contact op via{' '}
            <a href="mailto:info@intrict.com" className="underline font-semibold">info@intrict.com</a>{' '}
            als u vragen heeft over betaling.
          </span>
        </div>
      )}

      {/* Invoice document */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-8">
        {/* Sender / Receiver */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Van</p>
            <p className="font-bold text-slate-900">{COMPANY.name}</p>
            <p className="text-sm text-slate-500">{COMPANY.address}</p>
            <p className="text-sm text-slate-500">{COMPANY.postal} {COMPANY.city}</p>
            <p className="text-sm text-slate-500">BTW: {COMPANY.vat}</p>
            <p className="text-sm text-slate-500">{COMPANY.email}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Aan</p>
            {invoice.profile?.company && (
              <p className="font-bold text-slate-900">{invoice.profile.company}</p>
            )}
            {invoice.profile?.full_name && (
              <p className="text-sm text-slate-700 font-medium">{invoice.profile.full_name}</p>
            )}
            {invoice.profile?.address && (
              <p className="text-sm text-slate-500">{invoice.profile.address}</p>
            )}
            {(invoice.profile?.postal_code || invoice.profile?.city) && (
              <p className="text-sm text-slate-500">{invoice.profile.postal_code} {invoice.profile.city}</p>
            )}
            {invoice.profile?.vat_number && (
              <p className="text-sm text-slate-500">BTW: {invoice.profile.vat_number}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-0.5">Factuurnummer</p>
            <p className="font-semibold text-slate-800">{invoice.invoice_number}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-0.5">Factuurdatum</p>
            <p className="font-semibold text-slate-800">{fmtDate(invoice.issue_date)}</p>
          </div>
          {invoice.due_date && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-0.5">Vervaldatum</p>
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                {fmtDate(invoice.due_date)}
              </p>
            </div>
          )}
        </div>

        {/* Line items */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Omschrijving</th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Aantal</th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Prijs</th>
                <th className="py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Totaal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-slate-700">{item.description}</td>
                  <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-600">{fmt(item.unit_price)}</td>
                  <td className="py-3 text-right font-medium text-slate-800">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto max-w-xs space-y-1.5 text-sm border-t border-slate-100 pt-4">
          <div className="flex justify-between text-slate-500">
            <span>Subtotaal</span><span>{fmt(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>BTW {invoice.vat_rate}%</span><span>{fmt(invoice.vat_amount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-base text-slate-900">
            <span>Totaal</span><span>{fmt(invoice.total)}</span>
          </div>
        </div>

        {/* Notes + payment info */}
        {(invoice.notes || invoice.status !== 'paid') && (
          <div className="pt-4 border-t border-slate-100 space-y-3 text-sm text-slate-500">
            {invoice.status !== 'paid' && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs">
                <p className="font-semibold mb-0.5">Betalingsinstructies</p>
                <p>Gelieve {fmt(invoice.total)} over te schrijven op <strong>{COMPANY.iban}</strong> (BIC: {COMPANY.bic}).</p>
                <p>Mededeling: {invoice.invoice_number}</p>
                {invoice.due_date && <p>Uiterste betalingsdatum: {fmtDate(invoice.due_date)}</p>}
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="font-semibold text-slate-600 mb-0.5">Opmerkingen</p>
                <p>{invoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
