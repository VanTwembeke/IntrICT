'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Palette, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SLUGS = {
  nl: ['website-ontwikkeling', 'logo-en-branding', 'digitale-strategie'],
  en: ['website-development', 'logo-and-branding', 'digital-strategy'],
};
const ICONS = [Globe, Palette, Compass];

export default function Services() {
  const { t, lang } = useLanguage();
  const en = lang === 'en';
  return (
    <section lang={lang === 'en' ? 'en' : 'nl-BE'} id="services" aria-labelledby="services-heading" className="[font-family:Arial,Helvetica,sans-serif] scroll-mt-24 bg-white px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-blue-700">{en ? 'Built around your business' : 'Afgestemd op jouw onderneming'}</p>
          <h2 id="services-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t.services.heading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{en ? 'A new website, a recognizable brand or a clearer digital direction? Start with what you need.' : 'Een nieuwe website, een herkenbaar merk of meer richting online? Vertrek vanuit wat jij nodig hebt.'}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {t.services.items.map((service, i) => {
            const Icon = ICONS[i];
            return <article key={service.title} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700"><Icon size={24} aria-hidden="true" /></div>
              <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
              <p className="mt-4 flex-1 leading-relaxed text-slate-600">{service.description}</p>
              <Link href="/contact" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{t.contactSection.cta1}<ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href={`/blog/${SLUGS[lang][i]}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{service.buttonText}</Link>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
