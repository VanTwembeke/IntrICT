'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';
import { sharedT, voorwaardenT } from '@/i18n/legal';

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

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2 border-slate-200">
      <p className="mb-1 font-semibold text-slate-700">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
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

export default function Voorwaarden() {
  const { lang } = useLanguage();
  const c = lang === 'en' ? voorwaardenT.en : voorwaardenT.nl;
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
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
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

        {/* Binding language notice */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl px-4 py-2 mx-auto text-xs text-amber-700 text-center">
            {sh.bindingNotice}
          </div>
        </div>

        <div className="max-w-6xl px-4 py-12 mx-auto lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">{sh.toc}</p>
              </div>
              <nav className="px-3 py-3">
                {c.toc.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded bg-slate-700 shrink-0">{i + 1}</span>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <SectionBlock id="identificatie" number={1} title={s.identificatie.title}>
              <p>{s.identificatie.p1}</p>
              <div className="grid gap-1 p-4 rounded-lg bg-slate-50 text-slate-700 sm:grid-cols-2">
                {s.identificatie.tableRows.map(([k, v], i) => (
                  <><span key={`k${i}`} className="font-medium">{k}</span><span key={`v${i}`}>{v}</span></>
                ))}
              </div>
              <p>{s.identificatie.p2}</p>
            </SectionBlock>

            <SectionBlock id="toepassingsgebied" number={2} title={s.toepassingsgebied.title}>
              <p>{s.toepassingsgebied.p1}</p>
              <p>{s.toepassingsgebied.p2}</p>
              <p>{s.toepassingsgebied.p3}</p>
            </SectionBlock>

            <SectionBlock id="aanbod" number={3} title={s.aanbod.title}>
              <Sub title={s.aanbod.sub1.title}><p>{s.aanbod.sub1.p}</p></Sub>
              <Sub title={s.aanbod.sub2.title}><p>{s.aanbod.sub2.p}</p></Sub>
              <Sub title={s.aanbod.sub3.title}><p>{s.aanbod.sub3.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="diensten" number={4} title={s.diensten.title}>
              <p>{s.diensten.intro}</p>
              <Sub title={s.diensten.sub1.title}><p>{s.diensten.sub1.p}</p></Sub>
              <Sub title={s.diensten.sub2.title}><p>{s.diensten.sub2.p}</p></Sub>
              <Sub title={s.diensten.sub3.title}><p>{s.diensten.sub3.p}</p></Sub>
              <p>{s.diensten.p2}</p>
            </SectionBlock>

            <SectionBlock id="prijzen" number={5} title={s.prijzen.title}>
              <Bullet items={s.prijzen.items} />
            </SectionBlock>

            <SectionBlock id="betaling" number={6} title={s.betaling.title}>
              <Sub title={s.betaling.sub1.title}><p>{s.betaling.sub1.p}</p></Sub>
              <Sub title={s.betaling.sub2.title}><p>{s.betaling.sub2.p}</p></Sub>
              <Sub title={s.betaling.sub3.title}><p>{s.betaling.sub3.p}</p></Sub>
              <Sub title={s.betaling.sub4.title}><p>{s.betaling.sub4.p}</p></Sub>
              <Sub title={s.betaling.sub5.title}><p>{s.betaling.sub5.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="uitvoering" number={7} title={s.uitvoering.title}>
              <p>{s.uitvoering.p1}</p>
              <Sub title={s.uitvoering.sub1.title}><p>{s.uitvoering.sub1.p}</p></Sub>
              <Sub title={s.uitvoering.sub2.title}><p>{s.uitvoering.sub2.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="oplevering" number={8} title={s.oplevering.title}>
              <Sub title={s.oplevering.sub1.title}><p>{s.oplevering.sub1.p}</p></Sub>
              <Sub title={s.oplevering.sub2.title}><p>{s.oplevering.sub2.p}</p></Sub>
              <Sub title={s.oplevering.sub3.title}><p>{s.oplevering.sub3.p}</p></Sub>
              <Sub title={s.oplevering.sub4.title}><p>{s.oplevering.sub4.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="retainer" number={9} title={s.retainer.title} accent>
              <Sub title={s.retainer.sub1.title}><p>{s.retainer.sub1.p}</p></Sub>
              <Sub title={s.retainer.sub2.title}><p>{s.retainer.sub2.p}</p></Sub>
              <Sub title={s.retainer.sub3.title}><p>{s.retainer.sub3.p}</p></Sub>
              <Sub title={s.retainer.sub4.title}><p>{s.retainer.sub4.p}</p></Sub>
            </SectionBlock>

            {/* ── Herroepingsrecht — nieuw artikel ── */}
            <SectionBlock id="herroeping" number={10} title={s.herroeping.title}>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                {s.herroeping.b2cOnly}
              </div>
              <p>{s.herroeping.p1}</p>
              <Sub title={s.herroeping.sub1.title}><p>{s.herroeping.sub1.p}</p></Sub>
              <Sub title={s.herroeping.sub2.title}>
                <p>{s.herroeping.sub2.p}</p>
                <div className="mt-2 p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <p className="font-semibold text-slate-700 text-xs mb-2">{s.herroeping.formTitle}</p>
                  {s.herroeping.formContent.map((line, i) => (
                    <p key={i} className="text-xs text-slate-600">{line}</p>
                  ))}
                </div>
              </Sub>
              <Sub title={s.herroeping.sub3.title}><p>{s.herroeping.sub3.p}</p></Sub>
              <Sub title={s.herroeping.sub4.title}><p>{s.herroeping.sub4.p}</p></Sub>
              <Sub title={s.herroeping.sub5.title}><p>{s.herroeping.sub5.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="intellectueel" number={11} title={s.intellectueel.title}>
              <Sub title={s.intellectueel.sub1.title}><p>{s.intellectueel.sub1.p}</p></Sub>
              <Sub title={s.intellectueel.sub2.title}><p>{s.intellectueel.sub2.p}</p></Sub>
              <Sub title={s.intellectueel.sub3.title}><p>{s.intellectueel.sub3.p}</p></Sub>
              <Sub title={s.intellectueel.sub4.title}><p>{s.intellectueel.sub4.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="vertrouwelijkheid" number={12} title={s.vertrouwelijkheid.title}>
              <p>{s.vertrouwelijkheid.p1}</p>
              <p>{s.vertrouwelijkheid.p2}</p>
              <p>{s.vertrouwelijkheid.p3}</p>
            </SectionBlock>

            <SectionBlock id="aansprakelijkheid" number={13} title={s.aansprakelijkheid.title}>
              <Sub title={s.aansprakelijkheid.sub1.title}><p>{s.aansprakelijkheid.sub1.p}</p></Sub>
              <Sub title={s.aansprakelijkheid.sub2.title}><p>{s.aansprakelijkheid.sub2.p}</p></Sub>
              <Sub title={s.aansprakelijkheid.sub3.title}><p>{s.aansprakelijkheid.sub3.p}</p></Sub>
              <Sub title={s.aansprakelijkheid.sub4.title}><p>{s.aansprakelijkheid.sub4.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="overmacht" number={14} title={s.overmacht.title}>
              <p>{s.overmacht.p1}</p>
              <p>{s.overmacht.p2}</p>
            </SectionBlock>

            <SectionBlock id="beeindigen" number={15} title={s.beeindigen.title}>
              <Sub title={s.beeindigen.sub1.title}><p>{s.beeindigen.sub1.p}</p></Sub>
              <Sub title={s.beeindigen.sub2.title}><p>{s.beeindigen.sub2.p}</p></Sub>
              <Sub title={s.beeindigen.sub3.title}><p>{s.beeindigen.sub3.p}</p></Sub>
            </SectionBlock>

            <SectionBlock id="persoonsgegevens" number={16} title={s.persoonsgegevens.title}>
              <p>{s.persoonsgegevens.p1}</p>
              <Bullet items={s.persoonsgegevens.items} />
            </SectionBlock>

            <SectionBlock id="klachten" number={17} title={s.klachten.title}>
              <p>{s.klachten.p1}</p>
              <p>{s.klachten.p2}</p>
            </SectionBlock>

            <SectionBlock id="toepasselijk" number={18} title={s.toepasselijk.title}>
              <p>{s.toepasselijk.p1}</p>
              <p>
                {lang === 'nl'
                  ? <>In geval van een geschil zijn de rechtbanken van het gerechtelijk arrondissement <strong className="text-slate-700">Gent</strong> uitsluitend bevoegd, onverminderd het recht van IntrICT om het geschil voor te leggen aan de rechtbanken van de woonplaats of maatschappelijke zetel van de opdrachtgever.</>
                  : <>In the event of a dispute, the courts of the judicial district of <strong className="text-slate-700">Ghent</strong> shall have exclusive jurisdiction, without prejudice to IntrICT&apos;s right to submit the dispute to the courts of the client&apos;s place of residence or registered office.</>
                }
              </p>
              <p>{s.toepasselijk.p3}</p>
            </SectionBlock>

            <SectionBlock id="wijziging" number={19} title={s.wijziging.title} accent>
              <p>{s.wijziging.p1}</p>
              <p>{s.wijziging.p2}</p>
            </SectionBlock>

            <div className="p-6 mt-4 text-sm rounded-xl bg-slate-800 text-slate-300">
              <p className="mb-1 font-semibold text-white">{sh.contactFooterTitle}</p>
              <p>{s.footer} <a href="mailto:info@intrict.be" className="text-blue-400 underline hover:text-blue-300">info@intrict.be</a></p>
              <p className="mt-3 text-xs text-slate-400">{s.footerMeta}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
