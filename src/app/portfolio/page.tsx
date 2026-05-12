'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { ArrowRight, Code2, Hammer, Github } from 'lucide-react';

// Organization schema reference
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
    { "@type": "ListItem", position: 2, name: "Portfolio", item: "https://www.intrict.com/portfolio" },
  ],
};

const CASES = [
  {
    title: 'IntrICT.com — deze website',
    description:
      'Volledige stack: Next.js 16, React 19, Tailwind CSS v4, Supabase, Vercel. Inclusief klantendashboard, factuurmodule, berichtencentrum, afsprakensysteem en een GEO/SEO-geoptimaliseerde publieke website.',
    tags: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS v4'],
    href: 'https://www.intrict.com',
    linkLabel: 'Bekijk live',
    status: 'live' as const,
  },
];

export default function Portfolio() {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />

        <main>
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '32px 32px' }}
          />
          <div className="relative z-10 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Hammer size={12} />
                In opbouw
              </span>
              <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl leading-tight">
                Mijn werk
              </h1>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-slate-300">
                IntrICT is een jonge onderneming. Mijn eerste klantenprojecten worden hier toegevoegd zodra ze live zijn.
                Hieronder vind je wat ik tot nu toe heb gebouwd.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cases */}
        <section className="py-20 px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
          <div className="space-y-8">
            {CASES.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50">
                        <Code2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{c.title}</h2>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-5">{c.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {c.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    {c.linkLabel}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* GitHub link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100">
                <Github size={20} className="text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Open-source & persoonlijke projecten</p>
                <p className="text-sm text-slate-500">Bekijk mijn code en side-projects op GitHub</p>
              </div>
            </div>
            <a
              href="https://github.com/VanTwembeke"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shrink-0"
            >
              GitHub profiel
              <ArrowRight size={14} />
            </a>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 mx-auto max-w-5xl sm:px-6 lg:px-8 pb-24">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Wil je het eerste klantenproject worden?</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Ik neem nieuwe projecten aan. Neem contact op voor een gratis kennismakingsgesprek — zonder verplichtingen.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-colors text-sm shrink-0"
            >
              Gratis gesprek plannen
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
    </>
  );
}
