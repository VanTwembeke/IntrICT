'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Check, ArrowRight, Clock, Zap, Star,
  Globe, Lightbulb, Sparkles, GraduationCap,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Package } from '@/lib/types';

// ─── Icon mapping per package name ───────────────────────────────────────────

const ICON: Record<string, React.ReactNode> = {
  'Basic':                  <Clock size={20} />,
  'Standard':               <Zap size={20} />,
  'Premium':                <Star size={20} />,
  'Website Lancering':      <Globe size={20} />,
  'Strategisch ICT-Advies': <Lightbulb size={20} />,
  'AI-Infosessie':          <Sparkles size={20} />,
  'ICT-Workshop':           <GraduationCap size={20} />,
};

// ─── Color palette ────────────────────────────────────────────────────────────

const COLORS: Record<string, { iconBg: string; check: string; accent: string }> = {
  blue:   { iconBg: 'bg-blue-100 text-blue-600',   check: 'text-blue-500',   accent: 'text-blue-600' },
  purple: { iconBg: 'bg-purple-100 text-purple-600', check: 'text-purple-500', accent: 'text-purple-600' },
  indigo: { iconBg: 'bg-indigo-100 text-indigo-600', check: 'text-indigo-500', accent: 'text-indigo-600' },
  green:  { iconBg: 'bg-green-100 text-green-600',  check: 'text-green-500',  accent: 'text-green-600' },
  orange: { iconBg: 'bg-orange-100 text-orange-600', check: 'text-orange-500', accent: 'text-orange-600' },
};

const safeColor = (c: string) => COLORS[c] ?? COLORS.blue;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PricingProps {
  monthlyPackages: Package[];
  oneTimePackages: Package[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Pricing({ monthlyPackages, oneTimePackages }: PricingProps) {
  const { t } = useLanguage();
  const p = t.pricing;
  const [tab, setTab] = useState<'monthly' | 'onetime'>('monthly');

  if (monthlyPackages.length === 0 && oneTimePackages.length === 0) return null;

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10"
        >
          <span className="inline-block mb-4 px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full">
            {p.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {p.heading}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {p.subtitle}
          </p>
        </motion.div>

        {/* ── Trust badges ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2.5 mb-10"
        >
          {p.trust.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium rounded-full"
            >
              <Check size={13} className="text-green-500 shrink-0" />
              {badge}
            </span>
          ))}
        </motion.div>

        {/* ── Tab toggle ──────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 gap-1">
            <button
              onClick={() => setTab('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                tab === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.tabMonthly}
            </button>
            <button
              onClick={() => setTab('onetime')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                tab === 'onetime'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.tabOneTime}
            </button>
          </div>
        </div>

        {/* ── Package grids ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Monthly */}
          {tab === 'monthly' && (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <p className="text-center text-slate-500 text-sm mb-8 max-w-xl mx-auto">
                {p.monthlySubtitle}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {monthlyPackages.map((pkg, i) => {
                  const c = safeColor(pkg.color);
                  const icon = ICON[pkg.name] ?? <Clock size={20} />;

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`relative rounded-2xl flex flex-col ${
                        pkg.highlight
                          ? 'bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200/50 md:scale-[1.04]'
                          : 'bg-white border border-slate-200 shadow-sm'
                      }`}
                    >
                      {pkg.highlight && (
                        <div className="h-1 bg-linear-to-r from-yellow-400 to-orange-400 w-full rounded-t-2xl" />
                      )}

                      <div className="p-7 flex-1 flex flex-col">
                        {pkg.highlight && (
                          <span className="inline-block mb-3 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 rounded-full w-fit">
                            {p.popular}
                          </span>
                        )}

                        <div className={`inline-flex p-2.5 rounded-xl mb-4 w-fit ${
                          pkg.highlight ? 'bg-white/20 text-white' : c.iconBg
                        }`}>
                          {icon}
                        </div>

                        <h3 className={`text-xl font-bold mb-1 ${pkg.highlight ? 'text-white' : 'text-slate-900'}`}>
                          {pkg.name}
                        </h3>

                        <div className={`flex items-baseline gap-1 mb-3 ${pkg.highlight ? 'text-white' : 'text-slate-900'}`}>
                          <span className="text-4xl font-bold">€{pkg.price.toLocaleString('nl-BE')}</span>
                          <span className={`text-sm ${pkg.highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                            {p.perMonth}
                          </span>
                        </div>

                        <p className={`text-sm leading-relaxed mb-5 ${pkg.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                          {pkg.description}
                        </p>

                        <ul className="space-y-2.5 flex-1 mb-7">
                          {pkg.features.map((f) => (
                            <li key={f} className={`flex items-start gap-2 text-sm ${pkg.highlight ? 'text-blue-50' : 'text-slate-600'}`}>
                              <Check size={14} className={`shrink-0 mt-0.5 ${pkg.highlight ? 'text-blue-200' : c.check}`} />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="#contact"
                          className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            pkg.highlight
                              ? 'bg-white text-blue-700 hover:bg-blue-50'
                              : 'bg-slate-900 text-white hover:bg-slate-700'
                          }`}
                        >
                          {p.cta}
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* One-time */}
          {tab === 'onetime' && (
            <motion.div
              key="onetime"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              <p className="text-center text-slate-500 text-sm mb-8 max-w-xl mx-auto">
                {p.oneTimeSubtitle}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {oneTimePackages.map((pkg, i) => {
                  const c = safeColor(pkg.color);
                  const icon = ICON[pkg.name] ?? <Globe size={20} />;

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow duration-200"
                    >
                      <div className={`inline-flex p-2.5 rounded-xl mb-4 w-fit ${c.iconBg}`}>
                        {icon}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>

                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-3xl font-bold text-slate-900">
                          €{pkg.price.toLocaleString('nl-BE')}
                        </span>
                        <span className="text-sm text-slate-400">{p.oneTime}</span>
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                        {pkg.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check size={13} className={`shrink-0 mt-0.5 ${c.check}`} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href="#contact"
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200"
                      >
                        {p.cta}
                        <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 bg-slate-900 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <h3 className="text-white font-bold text-xl mb-1">{p.contactHeading}</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">{p.contactSubtitle}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-colors text-sm whitespace-nowrap"
            >
              {p.contactCta}
              <ArrowRight size={14} />
            </Link>
            <p className="text-xs text-slate-500">{p.vatNote}</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
