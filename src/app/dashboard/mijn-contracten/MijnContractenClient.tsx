'use client';

import { Globe, Server, AtSign, MoreHorizontal, CheckCircle2, XCircle, FileText } from 'lucide-react';
import type { Contract, ContractServiceType } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<ContractServiceType, string> = {
  website: 'Website Overname',
  hosting: 'Hosting',
  domain:  'Domeinnaam',
  other:   'Dienstverlening',
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
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtEuro(n: number) {
  return `\u20ac\u00a0${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MijnContractenClient({ contracts }: { contracts: Contract[] }) {
  const active    = contracts.filter((c) => c.status === 'active');
  const cancelled = contracts.filter((c) => c.status === 'cancelled');

  const totalMrr = active.reduce((s, c) => {
    const vat = c.monthly_price_excl_vat * (c.vat_rate / 100);
    return s + c.monthly_price_excl_vat + vat;
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mijn contracten</h1>
        <p className="text-sm text-slate-500">Overzicht van uw actieve diensten en overeenkomsten</p>
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl">
          <FileText size={36} className="text-slate-200 mb-3" />
          <p className="font-semibold text-slate-500">Geen actieve contracten gevonden.</p>
          <p className="text-sm text-slate-400 mt-1">
            Vragen? Neem contact op via{' '}
            <a href="mailto:info@intrict.com" className="text-blue-600 hover:underline">info@intrict.com</a>
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          {active.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Actieve diensten</p>
                <p className="text-2xl font-bold text-slate-900">{active.length}</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Maandelijks totaal</p>
                <p className="text-2xl font-bold text-green-600">{fmtEuro(totalMrr)}</p>
              </div>
            </div>
          )}

          {/* Active contracts */}
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Actieve diensten</h2>
              <div className="space-y-3">
                {active.map((c) => (
                  <ContractCard key={c.id} contract={c} />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled contracts */}
          {cancelled.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Beëindigd</h2>
              <div className="space-y-3">
                {cancelled.map((c) => (
                  <ContractCard key={c.id} contract={c} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-400 text-center">
        Vragen over een contract of opzegging?{' '}
        <a href="mailto:info@intrict.com" className="text-blue-600 hover:underline font-medium">Contacteer ons</a>
      </p>
    </div>
  );
}

// ── Contract card ─────────────────────────────────────────────────────────────

function ContractCard({ contract: c }: { contract: Contract }) {
  const isActive  = c.status === 'active';
  const vatAmount = c.monthly_price_excl_vat * (c.vat_rate / 100);
  const total     = c.monthly_price_excl_vat + vatAmount;

  return (
    <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${isActive ? 'border-slate-200' : 'border-slate-100 opacity-70'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${SERVICE_COLORS[c.service_type]}`}>
              {SERVICE_ICONS[c.service_type]}
              {SERVICE_LABELS[c.service_type]}
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle2 size={11} /> Actief
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                <XCircle size={11} /> Beëindigd
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 shrink-0">{c.contract_number}</p>
        </div>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{c.service_description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-slate-400 font-medium mb-0.5">Maandelijks</p>
            <p className="font-bold text-slate-900">{`\u20ac\u00a0${total.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
            <p className="text-slate-400">incl. BTW {c.vat_rate}%</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-0.5">Startdatum</p>
            <p className="font-semibold text-slate-700">{fmtDateShort(c.start_date)}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium mb-0.5">{isActive ? 'Volgende factuur' : 'Beëindigd op'}</p>
            <p className="font-semibold text-slate-700">
              {isActive ? fmtDateShort(c.first_invoice_date) : (c.cancellation_date ? fmtDateShort(c.cancellation_date) : '—')}
            </p>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Stilzwijgend jaarlijks verlengd · Opzegtermijn {c.notice_period_months} {c.notice_period_months === 1 ? 'maand' : 'maanden'}</span>
          <a href="mailto:info@intrict.com" className="text-blue-600 hover:underline font-medium">Opzeggen?</a>
        </div>
      )}
    </div>
  );
}
