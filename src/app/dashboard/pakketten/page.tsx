import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Check, Settings } from 'lucide-react';
import PackageRequestButton from './PackageRequestButton';
import type { Package } from '@/lib/types';

// ─── Fallback packages (shown if DB table not yet created) ───────────────────

const FALLBACK_PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    description: 'Ideaal voor starters en kleine bedrijven die online willen gaan.',
    features: ['5-pagina statische website', 'Responsief design (mobiel + desktop)', 'Contactformulier', 'Google Maps integratie', 'SSL-certificaat', '1 maand ondersteuning'],
    color: 'blue',
    highlight: false,
    active: true,
    sort_order: 0,
    billing_interval: 'one_time',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'business',
    name: 'Business',
    price: 999,
    description: 'Voor groeiende bedrijven die een krachtige online aanwezigheid nodig hebben.',
    features: ["Tot 10 pagina's", 'CMS (inhoud zelf beheren)', 'Blog & nieuwssectie', 'SEO-optimalisatie', 'Google Analytics koppeling', 'SSL-certificaat', '3 maanden ondersteuning'],
    color: 'purple',
    highlight: true,
    active: true,
    sort_order: 1,
    billing_interval: 'one_time',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1999,
    description: 'Volledige maatwerk webapplicatie of geavanceerde bedrijfswebsite.',
    features: ["Onbeperkt pagina's", 'Volledig maatwerk design', 'Geavanceerde functionaliteit', 'API-koppelingen', 'Dashboard & gebruikersbeheer', 'Performance-optimalisatie', 'SSL-certificaat', '6 maanden ondersteuning'],
    color: 'indigo',
    highlight: false,
    active: true,
    sort_order: 2,
    billing_interval: 'one_time',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: 2999,
    description: 'Complete webshop met alle functionaliteiten om online te verkopen.',
    features: ['Volledig ingerichte webshop', 'Productbeheer & categorieën', 'Betaalgateways (Mollie, Stripe)', 'Voorraadbeheer', 'Orderverwerking & e-mails', 'Klantaccounts', 'SSL-certificaat', '6 maanden ondersteuning'],
    color: 'green',
    highlight: false,
    active: true,
    sort_order: 3,
    billing_interval: 'one_time',
    created_at: '',
    updated_at: '',
  },
];

// ─── Color config ─────────────────────────────────────────────────────────────

type ColorKey = 'blue' | 'purple' | 'indigo' | 'green' | 'orange';

const colorConfig: Record<ColorKey, {
  iconBg: string;
  check: string;
  btn: string;
  isLight: boolean;
}> = {
  blue:   { iconBg: 'bg-blue-50 text-blue-600',    check: 'text-blue-500',   btn: 'bg-blue-600 hover:bg-blue-700 text-white',     isLight: true },
  purple: { iconBg: 'bg-white/20 text-white',       check: 'text-purple-200', btn: 'bg-white hover:bg-purple-50 text-purple-700',  isLight: false },
  indigo: { iconBg: 'bg-indigo-50 text-indigo-600', check: 'text-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', isLight: true },
  green:  { iconBg: 'bg-green-50 text-green-600',   check: 'text-green-500',  btn: 'bg-green-600 hover:bg-green-700 text-white',   isLight: true },
  orange: { iconBg: 'bg-orange-50 text-orange-600', check: 'text-orange-500', btn: 'bg-orange-600 hover:bg-orange-700 text-white', isLight: true },
};

const safeColor = (c: string): ColorKey =>
  (c as ColorKey) in colorConfig ? (c as ColorKey) : 'blue';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PakkettenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch from Supabase, fall back to hardcoded defaults
  let packages: Package[] = FALLBACK_PACKAGES;
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) {
      packages = data as Package[];
    }
  } catch {
    // table not yet created — fall back to defaults
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
            Diensten
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Onze pakketten</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Kies het pakket dat bij jouw project past. Geen verborgen kosten — vaste prijzen,
            heldere afspraken.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/pakketten/beheer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <Settings size={16} />
            Pakketten beheren
          </Link>
        )}
      </div>

      {/* ── Maandelijkse ondersteuning ────────────────────────────────── */}
      {packages.some((p) => p.billing_interval === 'monthly') && (
        <div className="mb-10">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Maandelijkse ondersteuning</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Vaste uren per maand voor een voorspelbare kost — zonder de overhead van een interne IT-medewerker.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {packages.filter((p) => p.billing_interval === 'monthly').map((pkg) => {
              const c = colorConfig[safeColor(pkg.color)];
              const isHighlight = pkg.highlight;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl flex flex-col overflow-hidden border ${
                    isHighlight
                      ? 'bg-linear-to-br from-blue-600 to-indigo-700 border-blue-500 shadow-xl shadow-blue-200/40 md:scale-[1.03]'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200'
                  }`}
                >
                  {isHighlight && <div className="h-1 bg-linear-to-r from-yellow-400 to-orange-400 w-full" />}
                  <div className="p-6 flex-1">
                    {isHighlight && (
                      <div className="mb-3">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 rounded-full">
                          Populairste keuze
                        </span>
                      </div>
                    )}
                    <div className={`inline-flex p-2.5 rounded-xl mb-4 ${isHighlight ? 'bg-white/20 text-white' : c.iconBg}`}>
                      <Check size={18} />
                    </div>
                    <h2 className={`text-xl font-bold mb-1 ${isHighlight ? 'text-white' : 'text-slate-900'}`}>
                      {pkg.name}
                    </h2>
                    <div className={`flex items-baseline gap-1 mb-3 ${isHighlight ? 'text-white' : 'text-slate-900'}`}>
                      <span className="text-3xl font-bold">€{pkg.price.toLocaleString('nl-BE')}</span>
                      <span className={`text-sm ${isHighlight ? 'text-blue-200' : 'text-slate-400'}`}>/ maand</span>
                    </div>
                    <p className={`text-sm mb-5 leading-relaxed ${isHighlight ? 'text-blue-100' : 'text-slate-500'}`}>
                      {pkg.description}
                    </p>
                    <ul className="space-y-2.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${isHighlight ? 'text-blue-100' : 'text-slate-600'}`}>
                          <Check size={14} className={`shrink-0 mt-0.5 ${isHighlight ? 'text-blue-300' : c.check}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <PackageRequestButton
                      packageName={pkg.name}
                      packagePrice={pkg.price}
                      isHighlight={isHighlight}
                      className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isHighlight ? 'bg-white text-blue-700 hover:bg-blue-50' : c.btn
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Eenmalige diensten ────────────────────────────────────────── */}
      {packages.some((p) => p.billing_interval === 'one_time') && (
        <div className="mb-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Eenmalige diensten</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Gerichte interventies voor specifieke noden — zonder langetermijnverbintenis.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.filter((p) => p.billing_interval === 'one_time').map((pkg) => {
              const c = colorConfig[safeColor(pkg.color)];
              return (
                <div
                  key={pkg.id}
                  className="relative rounded-2xl flex flex-col overflow-hidden border bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6 flex-1">
                    <div className={`inline-flex p-2.5 rounded-xl mb-4 ${c.iconBg}`}>
                      <Check size={18} />
                    </div>
                    <h2 className="text-lg font-bold mb-1 text-slate-900">{pkg.name}</h2>
                    <div className="flex items-baseline gap-1 mb-3 text-slate-900">
                      <span className="text-3xl font-bold">€{pkg.price.toLocaleString('nl-BE')}</span>
                      <span className="text-sm text-slate-400">eenmalig</span>
                    </div>
                    <p className="text-sm mb-5 leading-relaxed text-slate-500">{pkg.description}</p>
                    <ul className="space-y-2.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={14} className={`shrink-0 mt-0.5 ${c.check}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <PackageRequestButton
                      packageName={pkg.name}
                      packagePrice={pkg.price}
                      isHighlight={false}
                      className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${c.btn}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom project callout */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Specifieke noden of maatwerk project?</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Geen enkel pakket past perfect bij jouw project? Neem contact op en we maken
            een voorstel volledig op maat.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-colors text-sm shrink-0"
        >
          Contacteer ons
        </Link>
      </div>
    </div>
  );
}
