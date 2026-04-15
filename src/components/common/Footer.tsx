'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActionState } from 'react';
import { subscribeNewsletter, type NewsletterState } from '@/app/actions/newsletter';
import { blogPosts } from '@/data/blog-posts';

function pickRandom3() {
  const shuffled = [...blogPosts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((p) => ({ name: p.title, href: `/blog/${p.slug}` }));
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [randomPosts] = useState(pickRandom3);

  const footerLinks = {
    navigation: [
      { name: 'Home', href: '/' },
      { name: 'Portfolio', href: '/portfolio' },
      { name: 'Blog', href: '/blog' },
      { name: 'Oplossingen', href: '/oplossingen' },
    ],
    info: [
      { name: 'Visie', href: '/visie' },
      { name: 'Over Mij', href: '/over' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Sitemap', href: '/sitemap.xml' },
      { name: 'Robots', href: '/robots.txt' },
      { name: 'Privacybeleid', href: '/privacy' },
      { name: 'Algemene Voorwaarden', href: '/voorwaarden' },
      { name: 'Cookiebeleid', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  };

  const initialState: NewsletterState = { success: false };
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://linked.in/u/VanTwembeke',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/VanTwembeke/',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-slate-900">
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-500 to-transparent" />

      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* === NEWSLETTER SECTION === */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="border-b py-14 md:py-16 border-slate-700/60"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Copy */}
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold tracking-widest uppercase border rounded-full bg-slate-800 text-slate-400 border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nieuwsbrief
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Blijf op de hoogte
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Ontvang tips over webontwikkeling, design en digitale strategie — geen spam, enkel waardevolle inzichten.
              </p>
            </div>

            {/* Form */}
            <div className="w-full max-w-md lg:shrink-0">
              <AnimatePresence mode="wait">
                {state?.success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-5 py-4 border rounded-xl bg-emerald-500/10 border-emerald-500/30"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 shrink-0">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">Je bent ingeschreven!</p>
                      <p className="text-xs text-emerald-500/70">Bedankt — je ontvangt binnenkort nieuws.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    action={formAction}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="jouw@email.be"
                          className="w-full py-3 pl-10 pr-4 text-sm text-white transition-all duration-300 border placeholder-slate-500 bg-slate-800 rounded-xl border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 hover:border-slate-600"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={pending}
                        whileHover={{ scale: pending ? 1 : 1.03 }}
                        whileTap={{ scale: pending ? 1 : 0.97 }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 border rounded-xl bg-white/10 hover:bg-white/20 border-white/10 hover:border-white/20 disabled:opacity-50 shrink-0 backdrop-blur-sm"
                      >
                        {pending ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Bezig…
                          </>
                        ) : (
                          <>
                            Aanmelden
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </motion.button>
                    </div>
                    {state?.error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 flex items-center gap-1.5 text-xs text-red-400"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {state.error}
                      </motion.p>
                    )}
                    <p className="mt-2.5 text-xs text-slate-600">
                      Geen spam. Uitschrijven kan altijd. Powered by{' '}
                      <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline transition-colors text-slate-500 hover:text-slate-400 underline-offset-2">
                        Resend
                      </a>
                      .
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* === MAIN LINKS GRID === */}
        <div className="py-12 md:py-14">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-2 lg:col-span-1"
            >
              <a href="#" className="inline-block mb-4 text-xl font-bold tracking-tight text-white transition-colors hover:text-slate-300">
                IntrICT
              </a>
              <p className="mb-5 text-sm leading-relaxed text-slate-500">
                Moderne websites die werken — van concept tot live.
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700/50"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Navigatie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-slate-500">
                Navigatie
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.navigation.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Recente artikels (3 random blog posts) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-slate-500">
                Recente artikels
              </h3>
              <ul className="space-y-2.5">
                {randomPosts.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-slate-500">
                Info
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.info.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="pt-6 mt-6 border-t border-slate-800">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-slate-300 transition-colors group"
                >
                  Start je project
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* === BOTTOM BAR === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center justify-between gap-3 py-5 border-t border-slate-800 sm:flex-row"
        >
          <p className="text-xs text-slate-600">
            © {currentYear} IntrICT — Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs transition-colors duration-200 text-slate-600 hover:text-slate-400"
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
