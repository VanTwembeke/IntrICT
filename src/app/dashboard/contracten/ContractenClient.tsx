'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus, FileText, Globe, Server, AtSign, MoreHorizontal,
  CheckCircle2, XCircle, Search, Filter,
} from 'lucide-react';
import type { Contract, ContractServiceType } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<ContractServiceType, string> = {
  website: 'Website Overname',
  hosting: 'Hosting',
  domain:  'Domeinnaam',
  other:   'Andere',
};

const SERVICE_ICONS: Record<ContractServiceType, React.ReactNode> = {
  website: <Globe size={14} />,
  hosting: <Server size={14} />,
  domain:  <AtSign size={14} />,
  other:   <MoreHorizontal size={14} />,
};

const SERVICE_COLORS: Record<ContractServiceType, string> = {
  website: 'bg-blue-100 text-blue-700',
  hosting: 'bg-purple-100 text-purple-700',
  domain:  'bg-amber-100 text-amber-700',
  other:   'bg-slate-100 text-slate-600',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtEuro(n: number) {
  return `€\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function clientName(c: Contract): string {
  return c.profile?.full_name ?? c.guest_name ?? c.profile?.email ?? c.guest_email ?? '—';
}

function clientCompany(c: Contract): string | null {
  return c.profile?.company ?? c.guest_company ?? null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContractenClient({ initialContracts }: { initialContracts: Contract[] }) {
  const [contracts]   = useState<Contract[]>(initialContracts);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled'>('all');

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.contract_number.toLowerCase().includes(q) ||
      clientName(c).toLowerCase().includes(q) ||
      (clientCompany(c) ?? '').toLowerCase().includes(q) ||
      c.service_description.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount    = contracts.filter((c) => c.status === 'active').length;
  const cancelledCount = contracts.filter((c) => c.status === 'cancelled').length;
  const totalMrr = contracts
    .filter((c) => c.status === 'active')
    .reduce((s, c) => s + c.monthly_price_excl_vat, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracten</h1>
          <p className="text-sm text-slate-500">Overname overeenkomsten en dienstverleningscontracten</p>
        </div>
        <Link
          href="/dashboard/contracten/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          Nieuw contract
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Actief</p>
          <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Opgezegd</p>
          <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">MRR (excl. BTW)</p>
          <p className="text-2xl font-bold text-green-600">{fmtEuro(totalMrr)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek op nummer, klant, omschrijving…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
          />
        </div>
        <div className="inline-flex items-center gap-1 px-1 py-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <Filter size={12} className="text-slate-400 ml-1" />
          {(['all', 'active', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterStatus === s ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {s === 'all' ? 'Alle' : s === 'active' ? 'Actief' : 'Opgezegd'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} className="text-slate-200 mb-3" />
          <p className="font-semibold text-slate-500">
            {contracts.length === 0 ? 'Nog geen contracten aangemaakt.' : 'Geen contracten gevonden.'}
          </p>
          {contracts.length === 0 && (
            <Link
              href="/dashboard/contracten/nieuw"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus size={14} />
              Eerste contract aanmaken
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Contract</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Klant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Prijs/mnd</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Volgende factuur</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/contracten/${c.id}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{c.contract_number}</p>
                      <p className="text-xs text-slate-400">{fmtDate(c.start_date)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{clientName(c)}</p>
                      {clientCompany(c) && (
                        <p className="text-xs text-slate-400">{clientCompany(c)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SERVICE_COLORS[c.service_type]}`}>
                        {SERVICE_ICONS[c.service_type]}
                        {SERVICE_LABELS[c.service_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <p className="font-semibold text-slate-900">{fmtEuro(c.monthly_price_excl_vat)}</p>
                      <p className="text-xs text-slate-400">excl. BTW</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">
                      {c.status === 'active' ? fmtDate(c.first_invoice_date) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={11} />
                          Actief
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                          <XCircle size={11} />
                          Opgezegd
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
