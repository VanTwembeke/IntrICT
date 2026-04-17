'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';
import { sharedT, cookiesT } from '@/i18n/legal';

function SectionBlock({
  id, number, title, children, accent = false,
}: {
  id: string; number: number; title: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <div className={`rounded-xl border overflow-hidden ${accent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg shrink-0 bg-slate-800">
            {number}
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
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

function CookieRow({ name, type, purpose, duration }: {
  name: string; type: string; purpose: string; duration: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-3 py-2 text-xs font-mono text-slate-700 align-top">{name}</td>
      <td className="px-3 py-2 text-xs text-slate-600 align-top">{type}</td>
      <td className="px-3 py-2 text-xs text-slate-600 align-top">{purpose}</td>
      <td className="px-3 py-2 text-xs text-slate-600 align-top">{duration}</td>
    </tr>
  );
}

export default function Cookies() {
  const { lang } = useLanguage();
  const c = lang === 'en' ? cookiesT.en : cookiesT.nl;
  const sh = lang === 'en' ? sharedT.en : sharedT.nl;
  const ui = c.ui;
  const s = c.s;

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  const reopenCookieBanner = () => {
    localStorage.removeItem('cookie-consent');
    window.dispatchEvent(new CustomEvent('cookie-consent-reset'));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* Hero banner */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt={c.title}
            fill className="object-cover" priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/75 via-slate-800/55 to-slate-900/75" />
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <p className="mb-3 text-sm font-semibold tracking-widest text-slate-300 uppercase">IntrICT</p>
              <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">{c.title}</h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-300">{c.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Info bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl px-4 py-3 mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <span>{sh.version} &mdash; {sh.effective}</span>
            <span>{sh.updated}</span>
          </div>
        </div>

        <div className="max-w-6xl px-4 py-12 mx-auto lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">

          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">{sh.toc}</p>
                </div>
                <nav className="px-3 py-3">
                  {c.toc.map((item, i) => (
                    <a key={item.id} href={`#${item.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded bg-slate-700 shrink-0">
                        {i + 1}
                      </span>
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Settings shortcut */}
              <div className="bg-slate-800 rounded-xl p-5 text-white">
                <p className="text-sm font-semibold mb-1">{ui.settingsTitle}</p>
                <p className="text-xs text-slate-300 mb-4">{ui.settingsDesc}</p>
                <button
                  onClick={reopenCookieBanner}
                  className="w-full px-4 py-2 text-xs font-semibold text-slate-800 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {ui.settingsBtn}
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0">

            <SectionBlock id="wat" number={1} title={c.toc[0].title}>
              <p>{s.wat.p1}</p>
              <p>{s.wat.p2}</p>
              <p>{s.wat.p3}</p>
            </SectionBlock>

            <SectionBlock id="categorieen" number={2} title={c.toc[1].title}>
              <p>{s.categorieen.intro}</p>

              {/* Essential */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
                  <div>
                    <p className="text-sm font-semibold">{s.categorieen.essential.title}</p>
                    <p className="text-xs text-slate-300">{ui.essentialNote}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-500 text-white">{ui.essentialBadge}</span>
                </div>
                <p className="px-4 py-3 text-xs text-slate-600 border-b border-slate-100">
                  {s.categorieen.essential.desc}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {[ui.tableName, ui.tableType, ui.tablePurpose, ui.tableDuration].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.categorieen.essential.rows.map(([name, type, purpose, duration], i) => (
                        <CookieRow key={i} name={name} type={type} purpose={purpose} duration={duration} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-700 text-white">
                  <div>
                    <p className="text-sm font-semibold">{s.categorieen.analytics.title}</p>
                    <p className="text-xs text-slate-300">{ui.analyticsNote}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-400 text-white">{ui.optionalBadge}</span>
                </div>
                <p className="px-4 py-3 text-xs text-slate-600 border-b border-slate-100">
                  {s.categorieen.analytics.desc}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {[ui.tableName, ui.tableType, ui.tablePurpose, ui.tableDuration].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.categorieen.analytics.rows.map(([name, type, purpose, duration], i) => (
                        <CookieRow key={i} name={name} type={type} purpose={purpose} duration={duration} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-600 text-white">
                  <div>
                    <p className="text-sm font-semibold">{s.categorieen.functional.title}</p>
                    <p className="text-xs text-slate-300">{ui.functionalNote}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-400 text-white">{ui.optionalBadge}</span>
                </div>
                <p className="px-4 py-3 text-xs text-slate-600 border-b border-slate-100">
                  {s.categorieen.functional.desc}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {[ui.tableName, ui.tableType, ui.tablePurpose, ui.tableDuration].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.categorieen.functional.rows.map(([name, type, purpose, duration], i) => (
                        <CookieRow key={i} name={name} type={type} purpose={purpose} duration={duration} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-500 text-white">
                  <div>
                    <p className="text-sm font-semibold">{s.categorieen.marketing.title}</p>
                    <p className="text-xs text-slate-300">{ui.marketingNote}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-slate-300 text-slate-700">{ui.notInUseBadge}</span>
                </div>
                <p className="px-4 py-3 text-xs text-slate-600">
                  {s.categorieen.marketing.desc}
                </p>
              </div>
            </SectionBlock>

            <SectionBlock id="derden" number={3} title={c.toc[2].title}>
              <p>{s.derden.intro}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      {[ui.tableParty, ui.tablePurpose, ui.tableCategory, ui.tablePrivacy].map(h => (
                        <th key={h} className="px-3 py-2 text-left border border-slate-200 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.derden.rows.map(([party, purpose, category, url], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border border-slate-200 font-medium text-slate-700">{party}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{purpose}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{category}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-500 font-mono text-[11px]">{url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock id="toestemming" number={4} title={c.toc[3].title} accent>
              <p>{s.toestemming.p1}</p>
              <Bullet items={s.toestemming.items} />
              <p>
                {s.toestemming.p2.split('cookie-consent')[0]}
                <code className="px-1 py-0.5 rounded bg-slate-100 font-mono text-xs">localStorage</code>
                {' '}&mdash;{' '}
                <code className="px-1 py-0.5 rounded bg-slate-100 font-mono text-xs">cookie-consent</code>
                {s.toestemming.p2.split('cookie-consent')[1]}
              </p>
              <p>{s.toestemming.p3}</p>
              <button
                onClick={reopenCookieBanner}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {ui.changeSettingsBtn}
              </button>
            </SectionBlock>

            <SectionBlock id="rechten" number={5} title={c.toc[4].title}>
              <p>{s.rechten.p1}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {s.rechten.browsers.map(({ browser, path }, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 mb-1">{browser}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{path}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">{s.rechten.p2}</p>
              <p>
                {s.rechten.p3.split('info@intrict.be')[0]}
                <a href="mailto:info@intrict.be" className="text-blue-600 underline hover:text-blue-700">
                  info@intrict.be
                </a>
                {s.rechten.p3.split('info@intrict.be')[1].split(s.rechten.privacyLink)[0]}
                <a href="/gdpr" className="text-blue-600 underline hover:text-blue-700">
                  {s.rechten.privacyLink}
                </a>
                {s.rechten.p3.split(s.rechten.privacyLink)[1]}
              </p>
            </SectionBlock>

            <SectionBlock id="contact" number={6} title={c.toc[5].title}>
              <p>{s.contact.p1}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 mb-1">{s.contact.emailLabel}</p>
                  <a href="mailto:info@intrict.be" className="text-xs text-blue-600 underline hover:text-blue-700">
                    info@intrict.be
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 mb-1">{s.contact.authorityLabel}</p>
                  <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline hover:text-blue-700">
                    gegevensbeschermingsautoriteit.be
                  </a>
                </div>
              </div>
            </SectionBlock>

            <div className="p-6 mt-4 text-sm rounded-xl bg-slate-800 text-slate-300">
              <p className="mb-1 font-semibold text-white">{ui.footerTitle}</p>
              <p className="text-xs text-slate-400">{ui.footerMeta}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
