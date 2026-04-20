/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Coins,
  Smartphone,
  BookOpen,
  GraduationCap,
  Zap,
  Shield,
  FileText,
  Code,
  Heart,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';

const SERVICE_ICONS = [BookOpen, GraduationCap, Zap, Shield, FileText, Code];

export default function Oplossingen() {
  const { t } = useLanguage();
  const s = t.solutions;

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What specialised web development services does IntrICT offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IntrICT offers specialised solutions including Crypto & Blockchain consulting, Mini App development, technical consulting, digital training, system optimization, security audits, GDPR compliance support, and custom API development.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does IntrICT offer crypto and blockchain consulting?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. IntrICT provides practical advice on cryptocurrency, blockchain technology, and digital assets. This includes technology evaluation and investment guidance — without jargon.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a mini app and when does it make sense?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A mini app is a small, focused application that solves one specific business problem. Examples include automation tools, data processing scripts, integrations, and workflow optimisations. They are fast to develop and easy to maintain.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does IntrICT help with GDPR compliance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. IntrICT offers GDPR compliance support including privacy audits, cookie consent implementation, and documentation to ensure your website meets Belgian and European privacy regulations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there affordable options for small businesses or startups?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. IntrICT offers a free initial consultation and flexible rates for small websites and projects. Every collaboration starts with a no-obligation conversation to discuss your needs and budget.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
      />
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main>
        {/* Banner Section */}
        <section className="relative overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center pt-16">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Oplossingen - Gespecialiseerde web development oplossingen"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80" />
          <div className="relative z-10 w-full px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              {s.heading}
            </h1>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
              {s.heroSubtitle}
            </p>
          </div>
        </section>

        <div className="px-4 py-20 mx-auto max-w-7xl">

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="mb-8 text-4xl font-bold leading-tight md:text-5xl text-slate-800">
                {s.introHeading}
              </h2>
              <p className="mb-8 text-xl leading-relaxed text-slate-600">
                {s.introP1}
              </p>
              <p className="text-lg leading-relaxed text-slate-500">
                {s.introP2}
              </p>
            </div>
          </motion.div>

          {/* Main cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid gap-12 mb-20 lg:grid-cols-2"
          >
            <div className="p-10 border bg-slate-50 border-slate-200 rounded-2xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-slate-100">
                <Coins className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">{s.cryptoHeading}</h3>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">{s.cryptoP1}</p>
              <p className="leading-relaxed text-slate-500">{s.cryptoP2}</p>
            </div>

            <div className="p-10 border bg-slate-50 border-slate-200 rounded-2xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-slate-100">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">{s.miniAppsHeading}</h3>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">{s.miniAppsP1}</p>
              <p className="leading-relaxed text-slate-500">{s.miniAppsP2}</p>
            </div>
          </motion.div>

          {/* Specialised services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="p-12 bg-white border border-slate-200 rounded-2xl">
              <h3 className="mb-12 text-3xl font-bold text-center text-slate-800">{s.specialHeading}</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {s.services.map((svc, i) => {
                  const Icon = SERVICE_ICONS[i];
                  return (
                    <div key={svc.title} className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                        <Icon className="w-6 h-6 text-slate-600" />
                      </div>
                      <h4 className="mb-3 text-lg font-bold text-slate-800">{svc.title}</h4>
                      <p className="text-sm leading-relaxed text-slate-600">{svc.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Accessible web dev */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="p-12 border bg-linear-to-br from-slate-50 to-slate-100 border-slate-200 rounded-2xl">
              <h3 className="mb-8 text-3xl font-bold text-center text-slate-800">{s.accessHeading}</h3>
              <div className="max-w-4xl mx-auto">
                <p className="mb-8 text-xl leading-relaxed text-center text-slate-600">
                  {s.accessP}
                </p>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-slate-100">
                        <MessageCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">{s.freeConsultTitle}</h4>
                    </div>
                    <p className="mb-4 leading-relaxed text-slate-600">{s.freeConsultP}</p>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500">
                        <strong>{s.freeConsultNoteLabel}</strong> {s.freeConsultNote}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-slate-100">
                        <Heart className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">{s.flexPriceTitle}</h4>
                    </div>
                    <p className="mb-4 leading-relaxed text-slate-600">{s.flexPriceP}</p>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500">
                        <strong>{s.flexPriceNoteLabel}</strong> {s.flexPriceNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="p-12 bg-white border border-slate-200 rounded-2xl">
              <h3 className="mb-6 text-3xl font-bold text-slate-800">{s.ctaBoxHeading}</h3>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-600">
                {s.ctaBoxP}
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center px-8 py-4 space-x-3 text-lg font-medium text-white transition-colors duration-300 bg-slate-800 rounded-xl hover:bg-slate-700"
              >
                <span>{s.ctaBoxBtn}</span>
              </a>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
    </>
  );
}
