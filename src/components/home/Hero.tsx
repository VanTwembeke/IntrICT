'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { t, lang } = useLanguage();
  const en = lang === 'en';
  return (
    <section lang={lang === 'en' ? 'en' : 'nl-BE'} aria-labelledby="hero-heading" className="[font-family:Arial,Helvetica,sans-serif] relative overflow-hidden bg-slate-950 text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-blue-950/80 via-slate-950 to-indigo-950/60" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-36 sm:pb-24 lg:grid-cols-[1.15fr_1fr] lg:pt-44">
        <div>
          <p className="mb-6 text-sm font-semibold tracking-wide text-blue-200">{en ? 'Web development · Branding · Digital strategy' : 'Webontwikkeling · Branding · Digitale strategie'}</p>
          <h1 id="hero-heading" className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">{t.hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">{t.hero.startProject}<ArrowRight aria-hidden="true" size={18} /></Link>
            <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">{en ? 'Explore services' : 'Bekijk de diensten'}</a>
          </div>
          <p className="mt-4 text-sm text-slate-300">{en ? 'Start with a free introductory conversation. No account needed.' : 'Begin met een gratis kennismakingsgesprek. Geen account nodig.'}</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-slate-700 px-5 py-4" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-blue-400" /><span className="text-xs tracking-widest text-slate-300">INTRICT / {en ? 'FROM IDEA TO LAUNCH' : 'VAN IDEE TOT LIVE'}</span></div>
          <div className="relative h-44 sm:h-56"><Image src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=960&q=80" alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" priority /><div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" /></div>
          <div className="space-y-4 px-6 pb-6">
            <p className="text-lg font-semibold">{en ? 'One point of contact. A clear approach.' : 'Eén aanspreekpunt. Een heldere aanpak.'}</p>
            <ul className="space-y-3 text-sm text-slate-300">{t.process.steps.map((step) => <li key={step.title} className="flex items-center gap-3"><Check aria-hidden="true" size={16} className="shrink-0 text-blue-300" />{step.title}</li>)}</ul>
            <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">{t.hero.viewWork}<ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
