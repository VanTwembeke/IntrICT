'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import BlogDates from '@/components/common/BlogDates';
import { getBlogPostsForLang, sortBlogPostsByActivity, type BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-4';
function ArticleCard({ post, lang, featured, categories, readLabel, latestLabel }: {
  post: BlogPostMeta; lang: string; featured: boolean; categories: Record<string, string>; readLabel: string; latestLabel: string;
}) {
  return <article className={featured ? 'border-y border-slate-200 py-8 mb-10' : 'border-t border-slate-200 pt-6'}>
    <Link href={`/blog/${post.slug}`} className={`group grid min-w-0 gap-5 rounded-sm ${featured ? 'md:grid-cols-2 md:gap-10' : ''} ${focus}`}>
      <div className={`relative overflow-hidden bg-slate-100 rounded-lg ${featured ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
        <Image src={post.image} alt="" fill priority={featured}
          sizes={featured ? '(max-width: 767px) 100vw, 560px' : '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 360px'} className="object-cover" />
      </div>
      <div className={`min-w-0 flex flex-col items-start ${featured ? 'justify-center' : ''}`}>
        {featured && <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-700">{latestLabel}</p>}
        <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
          <span className="font-semibold text-blue-700">{categories[post.category] ?? post.category}</span>
          <BlogDates post={post} lang={lang} short /><span>{post.readTime} min</span>
        </p>
        <h2 className={`mb-3 font-bold leading-snug text-slate-900 [overflow-wrap:anywhere] group-hover:text-blue-700 ${featured ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>{post.title}</h2>
        <p className="mb-5 text-base leading-relaxed text-slate-600">{post.excerpt}</p>
        <span className="mt-auto py-2 text-sm font-semibold text-blue-700">{readLabel} <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  </article>;
}
function Archive({ lang }: { lang: string }) {
  const { t } = useLanguage();
  const en = lang === 'en';
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const posts = useMemo(() => sortBlogPostsByActivity(getBlogPostsForLang(lang)), [lang]);
  const categories = useMemo(() => [...new Set(posts.map(p => p.category))], [posts]);
  const term = query.trim().toLocaleLowerCase(lang);
  const filtered = posts.filter(p => (!category || p.category === category) && (!term ||
    [p.title, p.excerpt, p.category, t.blog.categories[p.category] ?? '', ...p.tags].join(' ').toLocaleLowerCase(lang).includes(term)));
  const unfiltered = !category && !term;
  return <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
    <header className="mb-8 max-w-3xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-700">{t.blog.label}</p>
      <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{en ? 'Ideas for your next digital step' : 'Ideeën voor je volgende digitale stap'}</h1>
      <p className="text-base leading-relaxed text-slate-600">{t.blog.subtitle}</p>
    </header>
    <section aria-label={en ? 'Find articles' : 'Vind artikelen'} className="mb-8 border-t border-slate-200 pt-6">
      <label htmlFor="article-search" className="mb-2 block text-sm font-semibold text-slate-800">{en ? 'Search articles' : 'Zoek artikelen'}</label>
      <input id="article-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? 'Topic, title or keyword' : 'Onderwerp, titel of trefwoord'}
        className={`mb-5 min-h-12 w-full max-w-xl rounded-lg border border-slate-400 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 ${focus}`} />
      <div role="group" aria-label={en ? 'Filter by topic' : 'Filter op onderwerp'} className="flex flex-wrap gap-2">
        {['', ...categories].map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}
          className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium ${focus} ${category === value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-600'}`}>
          {value ? (t.blog.categories[value] ?? value) : t.blog.allArticles}<span className="ml-2 tabular-nums">{value ? posts.filter(p => p.category === value).length : posts.length}</span>
        </button>)}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-4 text-sm text-slate-600">{t.blog.articleCount(filtered.length)} · {en ? 'Newest first' : 'Nieuwste eerst'}</p>
    </section>
    {filtered.length ? <>
      {unfiltered && <ArticleCard post={filtered[0]} lang={lang} featured categories={t.blog.categories} readLabel={t.blog.readArticle} latestLabel={t.blog.newest} />}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {(unfiltered ? filtered.slice(1) : filtered).map(post => <ArticleCard key={post.id} post={post} lang={lang} featured={false} categories={t.blog.categories} readLabel={t.blog.readArticle} latestLabel={t.blog.newest} />)}
      </div>
    </> : <div className="border-y border-slate-200 py-12">
      <h2 className="mb-3 text-xl font-bold text-slate-900">{en ? 'No articles found' : 'Geen artikelen gevonden'}</h2>
      <p className="mb-5 text-slate-600">{en ? 'Try another keyword or show all topics.' : 'Probeer een ander trefwoord of bekijk alle onderwerpen.'}</p>
      <button type="button" onClick={() => { setQuery(''); setCategory(''); }} className={`min-h-11 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white ${focus}`}>{en ? 'Clear filters' : 'Wis filters'}</button>
    </div>}
    <aside className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center">
      <p className="max-w-xl text-slate-700">{t.blog.ctaSubtitle}</p>
      <Link href="/contact" className={`inline-flex min-h-11 shrink-0 items-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 ${focus}`}>{t.blog.ctaContact}</Link>
    </aside>
  </div>;
}
export default function BlogClient() {
  const { lang } = useLanguage();
  return <div className="min-h-screen bg-white"><Header /><main><Archive key={lang} lang={lang} /></main><Footer /><BackToTop /></div>;
}
