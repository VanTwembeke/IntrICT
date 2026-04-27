'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Receipt, CheckCircle, Clock, AlertTriangle, FileText, Search,
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  draft:     { label: 'Concept',     badge: 'bg-slate-100 text-slate-500',   icon: <FileText size={12} /> },
  sent:      { label: 'Openstaand',  badge: 'bg-blue-100 text-blue-700',     icon: <Clock size={12} /> },
  paid:      { label: 'Betaald',     badge: 'bg-green-100 text-green-700',   icon: <CheckCircle size={12} /> },
  overdue:   { label: 'Vervallen',   badge: 'bg-red-100 text-red-700',       icon: <AlertTriangle size={12} /> },
  cancelled: { label: 'Geannuleerd', badge: 'bg-slate-100 text-slate-400',   icon: null },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtEuro(n: number) {
  return `€\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MijnFacturenClient({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState<InvoiceStatus | 'all'>('all');

  const filtered = invoices.filter((inv) => {
    if (tab !== 'all' && inv.status !== tab) return false;
    const q = search.toLowerCase();
    return !q || inv.invoice_number.toLowerCase().includes(q);
  });

  const totalOpen    = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const totalPaid    = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  const TABS: { key: InvoiceStatus | 'all'; label: string }[] = [
    { key: 'all',     label: 'Alle' },
    { key: 'sent',    label: 'Openstaand' },
    { key: 'overdue', label: 'Vervallen' },
    { key: 'paid',    label: 'Betaald' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mijn facturen</h1>
        <p className="text-sm text-slate-500">Overzicht van uw facturen en betalingen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Openstaand</p>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {totalOpen > 0 ? fmtEuro(totalOpen) : '—'}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Betaald totaal</p>
          <p className="text-2xl font-bold text-green-600">
            {totalPaid > 0 ? fmtEuro(totalPaid) : '—'}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Facturen</p>
          <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            U heeft <strong>{overdueCount} vervallen {overdueCount === 1 ? 'factuur' : 'facturen'}</strong>.
            Neem contact op via{' '}
            <a href="mailto:info@intrict.com" className="underline font-semibold">info@intrict.com</a>{' '}
            bij vragen over betaling.
          </span>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek op factuurnummer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="inline-flex gap-0.5 px-1 py-1 bg-slate-100 rounded-xl self-start">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-2xl">
          <Receipt size={36} className="text-slate-200 mb-3" />
          <p className="font-semibold text-slate-500">
            {invoices.length === 0 ? 'Nog geen facturen beschikbaar.' : 'Geen facturen gevonden.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((inv) => {
              const cfg = STATUS_CONFIG[inv.status];
              const isOverdue = inv.status === 'overdue';
              return (
                <Link
                  key={inv.id}
                  href={`/dashboard/mijn-facturen/${inv.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <Receipt size={16} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{inv.invoice_number}</p>
                    <p className="text-xs text-slate-400">
                      {fmtDate(inv.issue_date)}
                      {inv.due_date && ` · Vervaldatum ${fmtDate(inv.due_date)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{fmtEuro(inv.total)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Vragen over een factuur?{' '}
        <a href="mailto:info@intrict.com" className="text-blue-600 hover:underline font-medium">Contacteer ons</a>
      </p>
    </div>
  );
}
