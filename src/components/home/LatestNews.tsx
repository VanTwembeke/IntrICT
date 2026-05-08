'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

interface LatestNewsProps {
  postsNl: BlogPostMeta[];
  postsEn: BlogPostMeta[];
}

const cardVariants = {
  hidden: { y: 32 },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function formatDate(dateStr: string, lang: string) {
  return new Date(dateStr).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function LatestNews({ postsNl, postsEn }: LatestNewsProps) {
  const { lang } = useLanguage();
  const posts = lang === 'en' ? postsEn : postsNl;

  const featured = posts[0];
  const secondary = posts.slice(1, 4);

  if (!featured) return null;

  const heroImage = (src: string) =>
    src.includes('unsplash.com')
      ? src.replace(/\?.*$/, '') + '?auto=format&fit=crop&q=80'
      : src;

  return (
    <section className="py-20 bg-white">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 rounded-full">
            {lang === 'en' ? 'Knowledge & Insights' : 'Kennis & Inzichten'}
          </span>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
            {lang === 'en' ? 'Latest Articles' : 'Laatste Artikelen'}
          </h2>
          <p className="max-w-xl mx-auto text-lg text-slate-500">
            {lang === 'en'
              ? 'Stay informed about web development, digital strategy, and AI trends for Belgian SMEs.'
              : 'Blijf op de hoogte van webontwikkeling, digitale strategie en AI-trends voor Belgische KMO\'s.'}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Featured — large left card */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <Link
              href={`/blog/${featured.slug}`}
              className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
                <Image
                  src={heroImage(featured.image)}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                  {featured.category}
                </span>
              </div>
              <div className="flex flex-col flex-1 p-6">
                <p className="mb-2 text-xs font-medium text-slate-400">
                  {formatDate(featured.publishedAt, lang)}&nbsp;·&nbsp;{featured.readTime}&nbsp;min
                </p>
                <h3 className="mb-3 text-xl font-bold leading-snug text-slate-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {featured.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-1.5 mt-5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all duration-200">
                  {lang === 'en' ? 'Read article' : 'Lees artikel'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secondary — 3 stacked cards */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {secondary.map((post, i) => (
              <motion.div
                key={post.slug}
                custom={i + 1}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex gap-4 h-full p-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-xl sm:w-28 sm:h-28">
                    <Image
                      src={heroImage(post.image)}
                      alt={post.title}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="mb-1 text-[10px] font-semibold tracking-wider uppercase text-blue-500">
                      {post.category}&nbsp;·&nbsp;{post.readTime}&nbsp;min
                    </span>
                    <h3 className="mb-1.5 text-sm font-bold leading-snug text-slate-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ y: 16 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors duration-200"
          >
            {lang === 'en' ? 'View all articles' : 'Alle artikelen bekijken'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
