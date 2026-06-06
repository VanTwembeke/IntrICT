'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Receipt, Plus, Search, ArrowRight, RefreshCw,
  CheckCircle, Clock, AlertTriangle, XCircle, FileText, ReceiptText,
} from 'lucide-react';
import type { Invoice, InvoiceStatus, InvoiceType } from '@/lib/types';

const TABS: { key: InvoiceStatus | InvoiceType | 'all'; label: string }[] = [
  { key: 'all',         label: 'Alle' },
  { key: 'draft',       label: 'Concept' },
  { key: 'sent',        label: 'Verzonden' },
  { key: 'paid',        label: 'Betaald' },
  { key: 'overdue',     label: 'Vervallen' },
  { key: 'cancelled',   label: 'Geannuleerd' },
  { key: 'credit_note', label: 'Creditnota\'s' },
];

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  draft:     { label: 'Concept',     badge: 'bg-slate-100 text-slate-600',   icon: <FileText size={13} /> },
  sent:      { label: 'Verzonden',   badge: 'bg-blue-100 text-blue-700',     icon: <Clock size={13} /> },
  paid:      { label: 'Betaald',     badge: 'bg-green-100 text-green-700',   icon: <CheckCircle size={13} /> },
  overdue:   { label: 'Vervallen',   badge: 'bg-red-100 text-red-700',       icon: <AlertTriangle size={13} /> },
  cancelled: { label: 'Geannuleerd', badge: 'bg-slate-100 text-slate-400',   icon: <XCircle size={13} /> },
};

function fmt(n: number) {
  return `€${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FacturenClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices] = useState(initialInvoices);
  const [tab, setTab] = useState<InvoiceStatus | InvoiceType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = invoices.filter((inv) => {
    if (tab === 'credit_note') return inv.type === 'credit_note';
    if (tab !== 'all' && inv.status !== tab) return false;
    const q = search.toLowerCase();
    return !q ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.profile?.full_name?.toLowerCase().includes(q) ||
      inv.profile?.email?.toLowerCase().includes(q) ||
      inv.profile?.company?.toLowerCase().includes(q);
  });

  // Summary stats
  const totalPaid      = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.total ?? 0), 0);
  const totalOutstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.total ?? 0), 0);
  const totalOverdue   = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + (i.total ?? 0), 0);
  const recurringCount = invoices.filter((i) => i.is_recurring && i.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturen</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {invoices.length} facturen · {recurringCount} terugkerende
          </p>
        </div>
        <Link
          href="/dashboard/facturen/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm"
        >
          <Plus size={16} />
          Nieuwe factuur
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Betaald</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Openstaand</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(totalOutstanding)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Vervallen</p>
          <p className="text-2xl font-bold text-red-600">{fmt(totalOverdue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw size={13} className="text-purple-500" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Terugkerend</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{recurringCount}</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map((t) => {
            const count = t.key === 'all'
              ? invoices.length
              : t.key === 'credit_note'
              ? invoices.filter((i) => i.type === 'credit_note').length
              : invoices.filter((i) => i.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek factuur of klant…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Factuur</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Klant</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Datum</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Bedrag</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status];
              const isOverdue = inv.status === 'overdue';
              const isCN = inv.type === 'credit_note';
              return (
                <motion.tr
                  key={inv.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {isCN && <ReceiptText size={13} className="text-amber-500 shrink-0" />}
                      <p className="font-semibold text-slate-900">{inv.invoice_number}</p>
                      {inv.is_recurring && (
                        <RefreshCw size={11} className="text-purple-400" aria-label="Terugkerend" />
                      )}
                    </div>
                    {inv.due_date && !isCN && (
                      <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Vervaldatum: {fmtDate(inv.due_date)}
                      </p>
                    )}
                    {isCN && (
                      <p className="text-xs mt-0.5 text-amber-600 font-medium">Creditnota</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-slate-700 font-medium">{inv.profile?.full_name ?? inv.profile?.email ?? '—'}</p>
                    {inv.profile?.company && <p className="text-xs text-slate-400">{inv.profile.company}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                    {fmtDate(inv.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <p className={`font-bold ${isCN ? 'text-red-600' : 'text-slate-900'}`}>
                      {isCN ? `-${fmt(Math.abs(inv.total ?? 0))}` : fmt(inv.total ?? 0)}
                    </p>
                    {(inv.vat_rate ?? 0) > 0 && (
                      <p className="text-xs text-slate-400">{inv.vat_rate}% BTW</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/facturen/${inv.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <Receipt size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Geen facturen gevonden</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
