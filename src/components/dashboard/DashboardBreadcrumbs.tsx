'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  dashboard: 'Overzicht', aanvragen: 'Aanvragen', klanten: 'Klanten', messages: 'Berichten',
  pakketten: 'Pakketten', beheer: 'Beheer', kalender: 'Kalender', werktijden: 'Werktijden',
  tijdregistratie: 'Tijdregistratie', facturen: 'Facturen', contracten: 'Contracten',
  'mijn-facturen': 'Mijn facturen', 'mijn-contracten': 'Mijn contracten', nieuw: 'Nieuw',
  users: 'Gebruikers', nieuwsbrief: 'Abonnees', branding: 'Brandgids',
  profile: 'Mijn profiel', settings: 'Instellingen',
};

export default function DashboardBreadcrumbs() {
  const segments = usePathname().split('/').filter(Boolean);
  return (
    <nav aria-label="Kruimelpad" className="sticky top-0 z-20 flex min-h-[76px] items-center border-b border-slate-200 bg-white px-4 py-3 pl-20 lg:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {segments.map((segment, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
            {index === segments.length - 1
              ? <span aria-current="page" className="font-semibold text-slate-900">{LABELS[segment] ?? 'Detail'}</span>
              : <Link href={`/${segments.slice(0, index + 1).join('/')}`} className="inline-flex min-h-11 items-center hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600">{LABELS[segment] ?? 'Detail'}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
