'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogPostNotificationProps {
  post: BlogPostMeta;
}

export default function BlogPostNotification({ post }: BlogPostNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { lang } = useLanguage();

  const SESSION_KEY = `blog-notification-${post.slug}`;

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem(SESSION_KEY) === '1';
    if (alreadyDismissed) {
      setDismissed(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [SESSION_KEY]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  const reopen = () => {
    setVisible(true);
    setDismissed(false);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const heroImage = post.image.includes('unsplash.com')
    ? post.image.replace(/\?.*$/, '') + '?w=640&h=320&fit=crop&auto=format&q=80'
    : post.image;

  return (
    <>
      {/* Notification card */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-6 left-4 right-4 z-50 sm:left-6 sm:right-auto sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            role="dialog"
            aria-label={lang === 'en' ? 'New article' : 'Nieuw artikel'}
          >
            {/* Image with overlay */}
            <div className="relative h-36">
              <Image
                src={heroImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 to-transparent" />

              {/* Category badge */}
              <span className="absolute bottom-3 left-3 px-2.5 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                {post.category}
              </span>

              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Sluiten"
                className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="mb-1.5 text-xs font-semibold tracking-widest uppercase text-blue-500">
                {lang === 'en' ? 'New article' : 'Nieuw artikel'}&nbsp;·&nbsp;{post.readTime}&nbsp;min
              </p>
              <h3 className="mb-2 text-sm font-bold leading-snug text-slate-800 line-clamp-2">
                {post.title}
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-slate-500 line-clamp-2">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                onClick={dismiss}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm"
              >
                {lang === 'en' ? 'Read article' : 'Lees artikel'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini reopen trigger — linksonder, geen conflict met BackToTop (rechtsonder) */}
      <AnimatePresence>
        {dismissed && !visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={reopen}
            aria-label={lang === 'en' ? 'Show latest article' : 'Toon nieuwste artikel'}
            className="fixed bottom-8 left-8 z-50 flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">
              {lang === 'en' ? 'New article' : 'Nieuw artikel'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
