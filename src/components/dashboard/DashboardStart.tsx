import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardStart({ isAdmin }: { isAdmin: boolean }) {
  const actions = isAdmin ? [
    { href: '/dashboard/aanvragen', title: 'Aanvragen behandelen', detail: 'Bekijk nieuwe aanvragen en volg de status op.' },
    { href: '/dashboard/kalender', title: 'Planning openen', detail: 'Bevestig afspraken en bekijk je agenda.' },
    { href: '/dashboard/klanten', title: 'Klantdossiers openen', detail: 'Ga verder met je klanten en projecten.' },
  ] : [
    { href: '/dashboard/mijn-facturen', title: 'Bekijk mijn facturen', detail: 'Vind je facturen en openstaande bedragen.' },
    { href: '/dashboard/mijn-contracten', title: 'Bekijk mijn contracten', detail: 'Raadpleeg de afspraken over je diensten.' },
    { href: '/dashboard/messages', title: 'Stuur een bericht', detail: 'Stel je vraag of volg je gesprek op.' },
  ];
  return <section aria-labelledby="dashboard-start-title" className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-700">{isAdmin ? 'Werkruimte' : 'Mijn account'}</p>
      <h2 id="dashboard-start-title" className="text-lg font-bold text-slate-950">{isAdmin ? 'Aan de slag' : 'Wat wil je regelen?'}</h2>
    </div>
    <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
      {actions.map((action, index) => <Link key={action.href} href={action.href} className="group flex min-h-24 items-start gap-3 p-5 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-700 sm:p-6">
        <span aria-hidden="true" className="pt-0.5 text-xs font-semibold tabular-nums text-slate-500">0{index + 1}</span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-950 group-hover:text-blue-700">{action.title}</span><span className="mt-1 block text-sm leading-relaxed text-slate-600">{action.detail}</span></span>
        <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 text-blue-700" />
      </Link>)}
    </div>
  </section>;
}
