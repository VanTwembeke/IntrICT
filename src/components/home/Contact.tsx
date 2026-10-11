'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Faq from './Faq';

export default function Contact() {
  const { t, lang } = useLanguage();
  const en = lang === 'en';
  return (
    <>
    <Faq />
    <section lang={lang === 'en' ? 'en' : 'nl-BE'} id="contact" aria-labelledby="contact-heading" className="[font-family:Arial,Helvetica,sans-serif] scroll-mt-24 bg-slate-950 px-6 py-16 text-white sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold text-blue-300">{en ? 'Your next step' : 'Jouw volgende stap'}</p>
          <h2 id="contact-heading" className="text-3xl font-bold tracking-tight sm:text-5xl">{t.contactSection.heading}</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">{t.contactSection.subtitle}</p>
          <p className="mt-5 text-sm text-slate-300">{en ? 'Tell me about your idea, your goals and your timeline. We will discuss what fits your project.' : 'Vertel over je idee, je doelen en je timing. Samen bespreken we wat bij jouw project past.'}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
          <p className="mb-5 font-semibold">{en ? 'Start with a conversation' : 'Begin met een gesprek'}</p>
          <Link href="/contact" className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">{t.contactSection.cta1}<ArrowRight size={18} aria-hidden="true" /></Link>
          <p className="mt-5 text-center text-sm text-slate-300">{en ? 'Prefer email?' : 'Liever mailen?'} <a href="mailto:info@intrict.com" className="inline-flex min-h-11 items-center text-blue-200 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">info@intrict.com</a></p>
          <p className="mt-3 text-center text-sm text-slate-300">{en ? 'No account needed' : 'Geen account nodig'}</p>
          <Link href="/portfolio" className="mt-5 flex min-h-11 items-center justify-center text-sm font-semibold text-blue-200 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">{t.contactSection.cta2}</Link>
        </div>
      </div>
    </section>
    </>
  );
}
