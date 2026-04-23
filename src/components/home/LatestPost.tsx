'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

interface LatestPostProps {
  post: BlogPostMeta;
}

export default function LatestPost({ post }: LatestPostProps) {
  const { lang } = useLanguage();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    lang === 'en' ? 'en-GB' : 'nl-BE',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const heroImage = post.image.includes('unsplash.com')
    ? post.image.replace(/\?.*$/, '') + '?w=800&h=450&fit=crop&auto=format&q=80'
    : post.image;

  return (
    <section className="py-16 bg-slate-50">
      <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="inline-block w-8 h-0.5 bg-blue-500 rounded-full" />
          <span className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
            {lang === 'en' ? 'Latest from the blog' : 'Nieuwste van de blog'}
          </span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link href={`/blog/${post.slug}`} className="group block">
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl md:flex hover:shadow-xl transition-shadow duration-300">
              {/* Image */}
              <div className="relative flex-shrink-0 h-56 md:h-auto md:w-80">
                <Image
                  src={heroImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent md:bg-linear-to-r" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center flex-1 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3 text-sm text-slate-400">
                  <span>{formattedDate}</span>
                  <span>·</span>
                  <span>{post.readTime} min</span>
                </div>

                <h3 className="mb-3 text-xl font-bold leading-snug transition-colors duration-200 text-slate-800 md:text-2xl group-hover:text-blue-600 line-clamp-2">
                  {post.title}
                </h3>

                <p className="mb-5 text-sm leading-relaxed text-slate-500 line-clamp-3 md:text-base">
                  {post.excerpt}
                </p>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-200">
                  {lang === 'en' ? 'Read article' : 'Lees artikel'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
