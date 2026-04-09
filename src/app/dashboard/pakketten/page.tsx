import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Check, Package, Zap, Star, ShoppingCart } from 'lucide-react';

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: '499',
    color: 'blue',
    icon: Package,
    description: 'Ideaal voor starters en kleine bedrijven die online willen gaan.',
    features: [
      '5-pagina statische website',
      'Responsief design (mobiel + desktop)',
      'Contactformulier',
      'Google Maps integratie',
      'SSL-certificaat',
      '1 maand ondersteuning',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '999',
    color: 'purple',
    highlight: true,
    icon: Zap,
    description: 'Voor groeiende bedrijven die een krachtige online aanwezigheid nodig hebben.',
    features: [
      'Tot 10 pagina\'s',
      'CMS (inhoud zelf beheren)',
      'Blog & nieuwssectie',
      'SEO-optimalisatie',
      'Google Analytics koppeling',
      'SSL-certificaat',
      '3 maanden ondersteuning',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '1.999',
    color: 'indigo',
    icon: Star,
    description: 'Volledige maatwerk webapplicatie of geavanceerde bedrijfswebsite.',
    features: [
      'Onbeperkt pagina\'s',
      'Volledig maatwerk design',
      'Geavanceerde functionaliteit',
      'API-koppelingen',
      'Dashboard & gebruikersbeheer',
      'Performance-optimalisatie',
      'SSL-certificaat',
      '6 maanden ondersteuning',
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: '2.999',
    color: 'green',
    icon: ShoppingCart,
    description: 'Complete webshop met alle functionaliteiten om online te verkopen.',
    features: [
      'Volledig ingerichte webshop',
      'Productbeheer & categorieën',
      'Betaalgateways (Mollie, Stripe)',
      'Voorraadbeheer',
      'Orderverwerking & e-mails',
      'Klantaccounts',
      'SSL-certificaat',
      '6 maanden ondersteuning',
    ],
  },
] as const;

type Color = 'blue' | 'purple' | 'indigo' | 'green';

const colors: Record<Color, { icon: string; check: string; button: string; buttonText: string }> = {
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    check: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonText: '',
  },
  purple: {
    icon: 'bg-white/20 text-white',
    check: 'text-purple-300',
    button: 'bg-white hover:bg-purple-50 text-purple-700',
    buttonText: '',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    check: 'text-indigo-500',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    buttonText: '',
  },
  green: {
    icon: 'bg-green-50 text-green-600',
    check: 'text-green-500',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    buttonText: '',
  },
};

export default async function PakkettenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
          Diensten
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Onze pakketten</h1>
        <p className="text-slate-500 max-w-xl text-sm">
          Kies het pakket dat bij jouw project past. Geen verborgen kosten — vaste prijzen,
          heldere afspraken.
        </p>
      </div>

      {/* Packages grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {packages.map((pkg) => {
          const c = colors[pkg.color as Color];
          const isHighlight = 'highlight' in pkg && pkg.highlight;
          const Icon = pkg.icon;

          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl flex flex-col overflow-hidden border ${
                isHighlight
                  ? 'bg-linear-to-br from-purple-600 to-indigo-700 border-purple-500 shadow-xl shadow-purple-200/50'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200'
              }`}
            >
              {isHighlight && (
                <div className="h-1 bg-linear-to-r from-yellow-400 to-orange-400 w-full" />
              )}

              <div className="p-6 flex-1">
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${c.icon}`}>
                  <Icon size={20} />
                </div>

                {isHighlight && (
                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 rounded-full">
                      Populairste keuze
                    </span>
                  </div>
                )}

                <h2
                  className={`text-xl font-bold mb-1 ${
                    isHighlight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {pkg.name}
                </h2>

                <div
                  className={`flex items-baseline gap-1 mb-3 ${
                    isHighlight ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <span className="text-3xl font-bold">€{pkg.price}</span>
                  <span
                    className={`text-sm ${
                      isHighlight ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    eenmalig
                  </span>
                </div>

                <p
                  className={`text-sm mb-5 leading-relaxed ${
                    isHighlight ? 'text-purple-100' : 'text-slate-500'
                  }`}
                >
                  {pkg.description}
                </p>

                <ul className="space-y-2.5">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${
                        isHighlight ? 'text-purple-100' : 'text-slate-600'
                      }`}
                    >
                      <Check size={14} className={`shrink-0 mt-0.5 ${c.check}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/contact?subject=Pakket: ${pkg.name}`}
                  className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${c.button}`}
                >
                  Vraag offerte aan
                </Link>
              </div>
            </div>
          );
        })}
      </div>

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
