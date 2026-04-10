'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, FileText,
  RefreshCw, Printer, Trash2, ChevronDown,
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
  return `€${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function FactuurDetail({ invoice: initial }: { invoice: Invoice }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
            onClick={() => setStatusOpen((v) => !v)}
            disabled={saving || nextStatuses.length === 0}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${cfg.badge} ${
              nextStatuses.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
            }`}
          >
            {cfg.icon}{cfg.label}
            {nextStatuses.length > 0 && <ChevronDown size={14} className={statusOpen ? 'rotate-180' : ''} />}
          </button>
          {statusOpen && nextStatuses.length > 0 && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden min-w-[160px]">
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
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Afdrukken"
        >
          <Printer size={18} />
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

      {/* Invoice document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 print:shadow-none print:border-none print:rounded-none print:p-0">
        {/* Invoice header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">FACTUUR</h2>
            <p className="text-slate-500 text-sm">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">IntrICT</p>
            <p className="text-sm text-slate-400 mt-1">info@intrict.com</p>
          </div>
        </div>

        {/* Dates + client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Factuurgegevens</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex gap-3">
                <span className="text-slate-400 w-28 shrink-0">Factuurdatum</span>
                <span className="text-slate-700 font-medium">{fmtDate(invoice.issue_date ?? invoice.created_at)}</span>
              </div>
              {invoice.due_date && (
                <div className="flex gap-3">
                  <span className="text-slate-400 w-28 shrink-0">Vervaldatum</span>
                  <span className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : 'text-slate-700'}`}>
                    {fmtDate(invoice.due_date)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Klant</p>
            <div className="text-sm text-slate-700 space-y-0.5">
              {invoice.profile?.company && <p className="font-semibold">{invoice.profile.company}</p>}
              <p>{invoice.profile?.full_name}</p>
              <p className="text-slate-400">{invoice.profile?.email}</p>
              {invoice.profile?.vat_number && <p className="text-slate-400">BTW: {invoice.profile.vat_number}</p>}
              {invoice.profile?.address && (
                <p className="text-slate-400">
                  {invoice.profile.address}<br />
                  {invoice.profile.postal_code} {invoice.profile.city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Omschrijving</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-20">Aantal</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-28">Eenheidsprijs</th>
              <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-28">Totaal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoice.items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="py-3.5 text-slate-700">{item.description}</td>
                <td className="py-3.5 text-right text-slate-600">{item.quantity}</td>
                <td className="py-3.5 text-right text-slate-600">{fmt(item.unit_price)}</td>
                <td className="py-3.5 text-right font-semibold text-slate-800">{fmt(item.total ?? item.quantity * item.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotaal</span>
              <span className="font-medium">{fmt(invoice.subtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>BTW ({invoice.vat_rate ?? 21}%)</span>
              <span className="font-medium">{fmt(invoice.vat_amount ?? 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-lg pt-3 border-t-2 border-slate-200">
              <span>TOTAAL</span>
              <span>{fmt(invoice.total ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Opmerkingen</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
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
