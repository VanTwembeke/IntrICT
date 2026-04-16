'use client';

import { useEffect, useState, useMemo } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Tag, ArrowRight } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { blogPosts as allPosts } from '@/data/blog-posts';
import type { BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

// Sort newest first — static data, done once
const SORTED_POSTS: BlogPostMeta[] = [...allPosts]
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .map(({ content: _c, ...meta }) => meta as BlogPostMeta);

const CATEGORIES = ['Alle', ...Array.from(new Set(SORTED_POSTS.map((p) => p.category)))];

function fmtDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Featured post (first / newest) ──────────────────────────────────────────

function FeaturedPost({ post, lang, categoryMap, newestLabel, readLabel }: { post: BlogPostMeta; lang: string; categoryMap: Record<string, string>; newestLabel: string; readLabel: string }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4 hover:shadow-md transition-shadow duration-200"
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-72 lg:w-96 h-52 sm:h-auto shrink-0 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/30 to-transparent sm:bg-linear-to-r" />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-full">
            {newestLabel}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-6 lg:p-8 flex-1">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
                {categoryMap[post.category] ?? post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={11} />
                {fmtDate(post.publishedAt, lang)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {post.readTime} min
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors duration-200">
              {post.title}
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md">
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 mt-5 group-hover:gap-3 transition-all duration-200">
            {readLabel} <ArrowRight size={15} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ─── List post ────────────────────────────────────────────────────────────────

function ListPost({ post, index, lang, categoryMap, readMoreLabel }: { post: BlogPostMeta; index: number; lang: string; categoryMap: Record<string, string>; readMoreLabel: string }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <Link href={`/blog/${post.slug}`} className="flex gap-0">
        {/* Thumbnail */}
        <div className="relative w-28 sm:w-40 shrink-0 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-4 sm:p-5 flex-1 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
                {categoryMap[post.category] ?? post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={10} />
                {fmtDate(post.publishedAt, lang)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={10} />
                {post.readTime} min
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {post.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 hidden sm:block">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1 hidden sm:flex">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded">
                  #{tag}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 ml-auto group-hover:gap-2 transition-all duration-200">
              {readMoreLabel} <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('Alle');

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const filtered = useMemo(() =>
    activeCategory === 'Alle'
      ? SORTED_POSTS
      : SORTED_POSTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
          <div className="relative z-10 px-4 mx-auto text-center max-w-3xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">{t.blog.label}</p>
              <h1 className="text-4xl font-bold text-white md:text-5xl mb-4 leading-tight">
                {t.blog.heading}
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                {t.blog.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12">
          <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">

            {/* Filter bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {cat === 'Alle' ? t.blog.allArticles : (t.blog.categories[cat] ?? cat)}
                  {cat === 'Alle' && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {SORTED_POSTS.length}
                    </span>
                  )}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 hidden sm:block">
                {t.blog.articleCount(filtered.length)}
              </span>
            </motion.div>

            {/* List */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center bg-white rounded-2xl border border-slate-200"
                >
                  <p className="text-slate-400 text-sm">{t.blog.noArticles}</p>
                </motion.div>
              ) : (
                <motion.div key={activeCategory} layout className="space-y-4">
                  {featured && <FeaturedPost post={featured} lang={lang} categoryMap={t.blog.categories} newestLabel={t.blog.newest} readLabel={t.blog.readArticle} />}
                  {rest.map((post, i) => (
                    <ListPost key={post.id} post={post} index={i} lang={lang} categoryMap={t.blog.categories} readMoreLabel={t.blog.readMore} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-3xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                {t.blog.ctaHeading}<span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">{t.blog.ctaProject}</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {t.blog.ctaSubtitle}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="px-7 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
                  {t.blog.ctaContact}
                </Link>
                <Link href="/portfolio" className="px-7 py-3 font-semibold text-slate-300 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                  {t.blog.ctaPortfolio}
                </Link>
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
