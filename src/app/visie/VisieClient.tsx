'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Visie() {
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  const { t } = useLanguage();
  const waarden = t.vision.waarden;
  const werkwijze = t.vision.werkwijze;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center pt-16">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Visie — samenwerking en klantresultaat"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/85 via-slate-800/65 to-slate-900/85" />
          <div className="relative z-10 w-full px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-300 uppercase border border-blue-500/30 rounded-full bg-blue-500/10">
                {t.vision.badge}
              </span>
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                {t.vision.heading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  {t.vision.headingHighlight}
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-slate-200">
                {t.vision.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Intro ───────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-800 md:text-5xl">
                {t.vision.introHeading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {t.vision.introHighlight}
                </span>
              </h2>
              <p className="mb-6 text-xl leading-relaxed text-slate-600">
                {t.vision.introP1}
              </p>
              <p className="text-lg leading-relaxed text-slate-500">
                {t.vision.introP2}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Twee hoofdkaarten ───────────────────────────────────────────────── */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {t.vision.cards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="p-8 bg-white border border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-300 md:p-10"
                >
                  <div className="flex items-center justify-center w-14 h-14 mb-6 text-2xl rounded-2xl bg-blue-50">
                    {card.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-slate-800">{card.title}</h3>
                  <p className="mb-4 text-lg leading-relaxed text-slate-600">{card.body}</p>
                  <p className="leading-relaxed text-slate-500">{card.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Waarom anders ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h2 className="text-4xl font-bold text-slate-800 md:text-5xl">
                {t.vision.whyHeading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {t.vision.whyHighlight}
                </span>
              </h2>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {t.vision.whyItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 text-2xl rounded-2xl bg-white border border-slate-200 shadow-sm">
                    {item.icon}
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-slate-800">{item.title}</h4>
                  <p className="leading-relaxed text-slate-600 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Werkwijze timeline ──────────────────────────────────────────────── */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h2 className="text-4xl font-bold text-slate-800 md:text-5xl">
                {t.vision.werkwijzeTitle}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {t.vision.werkwijzeHighlight}
                </span>
              </h2>
            </motion.div>

            {/* Mobile: vertical cards */}
            <div className="flex flex-col gap-6 md:hidden">
              {werkwijze.map((step, i) => (
                <motion.div
                  key={step.nr}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-blue-600 text-white text-sm font-bold">
                      {step.nr}
                    </div>
                    {i < werkwijze.length - 1 && <div className="w-0.5 flex-1 mt-2 bg-blue-200" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="mb-2 text-xl font-bold text-slate-800">{step.title}</h4>
                    <p className="mb-3 leading-relaxed text-slate-600">{step.body}</p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-sm text-slate-500"><strong>{t.vision.inPractice}</strong> {step.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: alternating timeline */}
            <div className="hidden md:block relative max-w-4xl mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-slate-200" />
              <div className="space-y-12">
                {werkwijze.map((step, i) => {
                  const isLeft = i % 2 === 0;
                  return (
                    <motion.div
                      key={step.nr}
                      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-0"
                    >
                      {isLeft ? (
                        <>
                          <div className="w-1/2 pr-10 text-right">
                            <div className="p-7 bg-white border border-slate-200 shadow-sm rounded-2xl text-left">
                              <h4 className="mb-3 text-xl font-bold text-slate-800">{step.title}</h4>
                              <p className="mb-3 leading-relaxed text-slate-600">{step.body}</p>
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-sm text-slate-500"><strong>{t.vision.inPractice}</strong> {step.detail}</p>
                              </div>
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white font-bold text-sm border-4 border-white shadow-md">
                            {step.nr}
                          </div>
                          <div className="w-1/2 pl-10" />
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 pr-10" />
                          <div className="relative z-10 flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-blue-600 text-white font-bold text-sm border-4 border-white shadow-md">
                            {step.nr}
                          </div>
                          <div className="w-1/2 pl-10">
                            <div className="p-7 bg-white border border-slate-200 shadow-sm rounded-2xl">
                              <h4 className="mb-3 text-xl font-bold text-slate-800">{step.title}</h4>
                              <p className="mb-3 leading-relaxed text-slate-600">{step.body}</p>
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-sm text-slate-500"><strong>{t.vision.inPractice}</strong> {step.detail}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Waarden grid ────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h2 className="text-4xl font-bold text-slate-800 md:text-5xl">
                {t.vision.waardenHeading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {t.vision.waardenHighlight}
                </span>
              </h2>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {waarden.map((w, i) => (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-14 h-14 mb-4 text-2xl rounded-2xl bg-white border border-slate-200 shadow-sm">
                    {w.icon}
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-800">{w.title}</h4>
                  <p className="text-sm leading-relaxed text-slate-600">{w.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Wat maakt mij anders ────────────────────────────────────────────── */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h2 className="text-4xl font-bold text-slate-800 md:text-5xl">
                {t.vision.differentHeading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  {t.vision.differentHighlight}
                </span>
              </h2>
            </motion.div>
            <div className="grid gap-8 lg:grid-cols-2">
              {t.vision.differentItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm"
                >
                  <div className="shrink-0 mt-1 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <h4 className="mb-2 text-lg font-bold text-slate-800">{item.title}</h4>
                    <p className="leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                {t.vision.ctaHeading}{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  {t.vision.ctaHighlight}
                </span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                {t.vision.ctaSubtitle}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  {t.vision.ctaBtn1}
                </motion.a>
                <motion.a
                  href="/over"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10"
                >
                  {t.vision.ctaBtn2}
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
