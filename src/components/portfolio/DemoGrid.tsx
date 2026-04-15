'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DemoMeta } from '@/app/api/demos/route';

// ─── Live iframe preview ──────────────────────────────────────────────────────

function DemoPreview({ slug, title }: { slug: string; title: string }) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-slate-100" style={{ height: '220px' }}>
      {/* Skeleton loader — shown until iframe loads */}
      {(!inView || !loaded) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
          {inView ? (
            <>
              <div className="w-7 h-7 border-2 border-slate-300 border-t-blue-400 rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-400">Preview laden…</span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-400">{title}</span>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="text-3xl mb-2">🖥️</div>
            <span className="text-sm text-slate-400">Preview niet beschikbaar</span>
          </div>
        </div>
      )}

      {/* Iframe — only mounted once card enters viewport */}
      {inView && !error && (
        <iframe
          src={`/demo/${slug}/demo.html`}
          title={`Preview: ${title}`}
          className="absolute top-0 left-0 border-0 pointer-events-none"
          style={{
            width: '1280px',
            height: '720px',
            transform: 'scale(0.3)',
            transformOrigin: 'top left',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Transparent overlay to block mouse interaction with the iframe */}
      <div className="absolute inset-0" />
    </div>
  );
}

// ─── Individual demo card ─────────────────────────────────────────────────────

function DemoCard({ demo, index }: { demo: DemoMeta; index: number }) {
  const accent = demo.accent ?? '#3b82f6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col"
    >
      {/* Preview window */}
      <div className="relative">
        <DemoPreview slug={demo.slug} title={demo.title} />

        {/* Top-right category badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className="px-2.5 py-1 text-xs font-semibold rounded-full text-white shadow-md capitalize"
            style={{ backgroundColor: accent }}
          >
            {demo.category}
          </span>
        </div>

        {/* Hover overlay with "open" cue */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-semibold text-slate-800 shadow-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Bekijk live demo
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-6 flex flex-col flex-1">
        {demo.client && (
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accent }}>
            {demo.client}
          </p>
        )}
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
          {demo.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-500 mb-4 flex-1 line-clamp-3">
          {demo.description}
        </p>

        {/* Tech badges */}
        {demo.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {demo.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={`/demo/${demo.slug}`}
          className="mt-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
          style={{ backgroundColor: accent }}
        >
          Bekijk Demo
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-md animate-pulse">
      <div className="h-[220px] bg-slate-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-24 bg-slate-200 rounded-full" />
        <div className="h-5 w-3/4 bg-slate-200 rounded-full" />
        <div className="h-3 w-full bg-slate-100 rounded-full" />
        <div className="h-3 w-5/6 bg-slate-100 rounded-full" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-slate-100 rounded-full" />
          <div className="h-6 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

// ─── Category filter bar ──────────────────────────────────────────────────────

function CategoryFilter({
  demos,
  activeCategory,
  onCategoryChange,
}: {
  demos: DemoMeta[];
  activeCategory: string;
  onCategoryChange: (c: string) => void;
}) {
  const categories = [
    { id: 'all', name: 'Alle projecten' },
    ...Array.from(new Set(demos.map((d) => d.category))).map((c) => ({
      id: c,
      name: c.charAt(0).toUpperCase() + c.slice(1),
    })),
  ];

  if (categories.length <= 2) return null; // only show if there's more than 1 category

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-14">
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(cat.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-250 ${
            activeCategory === cat.id
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'
          }`}
        >
          {cat.name}
          <span className="ml-1.5 text-xs opacity-60">
            ({cat.id === 'all' ? demos.length : demos.filter((d) => d.category === cat.id).length})
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  demos: DemoMeta[];
  loading: boolean;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
}

export default function DemoGrid({ demos, loading, activeCategory, onCategoryChange }: Props) {
  const filtered =
    activeCategory === 'all' ? demos : demos.filter((d) => d.category === activeCategory);

  return (
    <section className="py-24 bg-linear-to-b from-white to-slate-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500 mb-3">
            Live demo&apos;s
          </p>
          <h2 className="text-4xl font-bold text-slate-800 md:text-5xl mb-4">
            Projecten die we voor je kunnen bouwen
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-500">
            Klik op een project om de volledige demo te bekijken — gebouwd en gehost door IntrICT.
          </p>
        </motion.div>

        {/* Category filter */}
        {!loading && (
          <CategoryFilter
            demos={demos}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <div className="text-5xl mb-4">🗂️</div>
            <p className="text-lg text-slate-500">Geen projecten in deze categorie.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((demo, i) => (
                <DemoCard key={demo.slug} demo={demo} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Coming soon teaser (when there are demos) */}
        {!loading && demos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-slate-400">
              Meer demo&apos;s zijn onderweg.{' '}
              <a href="/contact" className="text-blue-500 font-medium hover:underline">
                Neem contact op
              </a>{' '}
              voor een demo op maat.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
