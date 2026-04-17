'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';
import { sharedT, privacyT } from '@/i18n/legal';

function SectionBlock({ id, number, title, children, accent = false }: {
  id: string; number: number; title: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <div className={`rounded-xl border overflow-hidden ${accent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg shrink-0 bg-slate-800">{number}</div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
    </section>
  );
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Privacy() {
  const { lang } = useLanguage();
  const c = lang === 'en' ? privacyT.en : privacyT.nl;
  const sh = lang === 'en' ? sharedT.en : sharedT.nl;

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  const s = c.s;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt={c.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/75 via-slate-800/55 to-slate-900/75" />
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <p className="mb-3 text-sm font-semibold tracking-widest text-slate-300 uppercase">IntrICT</p>
              <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">{c.title}</h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-300">{c.subtitle}</p>
            </div>
          </div>
        </section>

        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl px-4 py-3 mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <span>{sh.version} &mdash; {sh.effective}</span>
            <span>{sh.updated}</span>
          </div>
        </div>

        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-6xl px-4 py-2.5 mx-auto text-xs text-blue-700 text-center">
            {c.redirectNotice}{' '}
            <a href="/gdpr" className="underline font-medium hover:text-blue-900">{c.redirectLink}</a>
            {' '}{c.redirectEnd}
          </div>
        </div>

        <div className="max-w-6xl px-4 py-12 mx-auto lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">{sh.toc}</p>
              </div>
              <nav className="px-3 py-3">
                {c.toc.map((item, i) => (
                  <a key={item.id} href={`#${item.id}`} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded bg-slate-700 shrink-0">{i + 1}</span>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <SectionBlock id="wie" number={1} title={s.wie.title}>
              <p>{s.wie.p1}</p>
            </SectionBlock>

            <SectionBlock id="welke" number={2} title={s.welke.title}>
              <Bullet items={s.welke.items} />
            </SectionBlock>

            <SectionBlock id="waarom" number={3} title={s.waarom.title}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{s.waarom.purposeCol}</th>
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{s.waarom.basisCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.waarom.rows.map(([purpose, basis], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{purpose}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock id="hoe-lang" number={4} title={lang === 'nl' ? 'Hoe lang bewaren wij uw gegevens?' : 'How long do we retain your data?'}>
              <p>{lang === 'nl' ? 'Wij bewaren uw gegevens niet langer dan noodzakelijk:' : 'We do not retain your data longer than necessary:'}</p>
              <Bullet items={lang === 'nl' ? [
                'Contactberichten: max. 12 maanden na laatste contact indien geen klantrelatie.',
                'Klantgegevens en facturen: 10 jaar (wettelijke boekhoudkundige bewaarplicht).',
                'Nieuwsbrief: tot u zich uitschrijft.',
                'Accountgegevens: tot u uw account verwijdert of 12 maanden na inactiviteit.',
              ] : [
                'Contact messages: max. 12 months after last contact if no client relationship.',
                'Client data and invoices: 10 years (statutory accounting retention obligation).',
                'Newsletter: until you unsubscribe.',
                'Account data: until account deletion or 12 months after inactivity.',
              ]} />
            </SectionBlock>

            <SectionBlock id="rechten" number={5} title={s.rechten.title}>
              <p>{s.rechten.p1}</p>
              <Bullet items={s.rechten.items} />
              <p>{s.rechten.p2}</p>
            </SectionBlock>

            <SectionBlock id="beveiliging" number={6} title={s.beveiliging.title}>
              <Bullet items={s.beveiliging.items} />
            </SectionBlock>

            <SectionBlock id="contact" number={7} title={s.contact.title} accent>
              <p>{s.contact.p1}</p>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-800 mb-1">{s.contact.gbaLabel}</p>
                <p className="text-xs text-slate-600">{s.contact.gbaAddress}</p>
              </div>
              <p className="text-xs text-slate-500">
                {s.contact.moreInfo}{' '}
                <a href="/gdpr" className="text-blue-600 underline hover:text-blue-700">{s.contact.moreInfoLink}</a>
              </p>
            </SectionBlock>

            <div className="p-6 mt-4 text-sm rounded-xl bg-slate-800 text-slate-300">
              <p className="mb-1 font-semibold text-white">{sh.contactFooterTitle}</p>
              <p><a href="mailto:info@intrict.be" className="text-blue-400 underline hover:text-blue-300">info@intrict.be</a></p>
              <p className="mt-3 text-xs text-slate-400">{c.footer}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
