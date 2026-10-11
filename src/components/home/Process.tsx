'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Process() {
  const { t, lang } = useLanguage();
  const en = lang === 'en';
  return (
    <section lang={lang === 'en' ? 'en' : 'nl-BE'} id="workflow" aria-labelledby="workflow-heading" className="[font-family:Arial,Helvetica,sans-serif] scroll-mt-24 border-y border-slate-200 bg-slate-50 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-blue-700">{en ? 'From first conversation to launch' : 'Van eerste gesprek tot lancering'}</p>
          <h2 id="workflow-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{t.process.heading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{t.process.subtitle}</p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3" role="list">
          {t.process.steps.map((step, i) => <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <span aria-hidden="true" className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">0{i + 1}</span>
            <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
            <p className="mt-3 leading-relaxed text-slate-600">{step.desc}</p>
          </li>)}
        </ol>
        <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{en ? 'Arrange an introduction' : 'Plan een kennismaking'}<ArrowRight aria-hidden="true" size={18} /></Link>
      </div>
    </section>
  );
}
