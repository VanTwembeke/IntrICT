'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Lenis from 'lenis';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { BlogPost, BlogPostMeta } from '@/lib/blog-api';
import { useLanguage } from '@/contexts/LanguageContext';

const SITE_URL = 'https://www.intrict.com';

// ShareButtons Component
const ShareButtons = ({ slug, title }: { slug: string; title: string }) => {
  const [copied, setCopied] = useState(false);
  const postUrl = `${SITE_URL}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const platforms = [
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:border-[#1877F2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-slate-900 hover:border-slate-900',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:border-[#25D366]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-6 mt-8 border-t border-slate-200">
      <p className="mb-3 text-sm font-semibold text-slate-700">Deel dit artikel</p>
      <div className="flex flex-wrap items-center gap-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Deel op ${p.name}`}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg transition-all duration-200 hover:text-white ${p.color}`}
          >
            {p.icon}
            <span className="hidden sm:inline">{p.name}</span>
          </a>
        ))}
        <button
          onClick={copyLink}
          aria-label="Kopieer link"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg transition-all duration-200 hover:bg-slate-100"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline text-green-600">Gekopieerd!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden sm:inline">Kopieer link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// CodeBlock Component
const CodeBlock = ({ code, language, copyLabel, copiedLabel }: { code: string; language: string; copyLabel: string; copiedLabel: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-800 border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm text-slate-400">{language}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center px-3 py-1 space-x-1 text-sm transition-colors duration-200 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{copiedLabel}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copyLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-slate-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// YouTube Embed Component
const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  return (
    <div className="relative w-full h-0 pb-[56.25%] bg-slate-900 rounded-lg overflow-hidden shadow-lg">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

interface BlogPostClientProps {
  initialPost: BlogPost | null;
  initialRelatedPosts: BlogPostMeta[];
}

export default function BlogPostClient({ initialPost, initialRelatedPosts }: BlogPostClientProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const p = t.blog.post;

  const [blogPost] = useState<BlogPost | null>(initialPost);
  const [relatedPosts] = useState<BlogPostMeta[]>(initialRelatedPosts);
  const loading = false;

  // Smooth scroll — isolated with cleanup to prevent memory leaks
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Auto-navigate to translated post when language is switched
  useEffect(() => {
    if (!blogPost) return;
    const postLang = blogPost.lang ?? 'nl';
    if (postLang !== lang && blogPost.translationSlug) {
      router.push(`/blog/${blogPost.translationSlug}`);
    }
  }, [lang, blogPost, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-BE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedContent = useMemo(() => {
    if (!blogPost) return null;
    const content = blogPost.content;
    const formatContent = (content: string) => {
      const lines = content.split('\n');
      const elements: React.ReactElement[] = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('# ')) {
          elements.push(
            <h1 key={i} className="mt-8 mb-4 text-4xl font-bold text-slate-800">
              {line.substring(2)}
            </h1>
          );
        } else if (line.startsWith('## ')) {
          elements.push(
            <h2 key={i} className="mt-6 mb-3 text-3xl font-bold text-slate-800">
              {line.substring(3)}
            </h2>
          );
        } else if (line.startsWith('### ')) {
          elements.push(
            <h3 key={i} className="mt-4 mb-2 text-2xl font-bold text-slate-800">
              {line.substring(4)}
            </h3>
          );
        } else if (line.startsWith('```')) {
          const language = line.substring(3).trim() || 'text';
          const codeLines: string[] = [];
          i++;

          while (i < lines.length && !lines[i].startsWith('```')) {
            codeLines.push(lines[i]);
            i++;
          }

          elements.push(
            <div key={i} className="my-4">
              <CodeBlock
                code={codeLines.join('\n')}
                language={language}
                copyLabel={p.copy}
                copiedLabel={p.copied}
              />
            </div>
          );
        } else if (line.startsWith('https://www.youtube.com/watch?v=') || line.startsWith('https://youtu.be/')) {
          const videoId = extractYouTubeVideoId(line);
          if (videoId) {
            elements.push(
              <div key={i} className="my-6">
                <YouTubeEmbed videoId={videoId} />
              </div>
            );
          }
        } else if (line.startsWith('|') && i + 1 < lines.length && /^\|[\s|:-]+\|/.test(lines[i + 1])) {
          // Markdown table: current line = header, next line = separator, then body rows
          const parseRow = (l: string) => l.split('|').slice(1, -1).map(c => c.trim());
          const headers = parseRow(line);
          i += 2; // skip separator row
          const rows: string[][] = [];
          while (i < lines.length && lines[i].startsWith('|')) {
            rows.push(parseRow(lines[i]));
            i++;
          }
          i--; // compensate for outer i++
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {headers.map((h, j) => (
                      <th key={j} className="border border-slate-200 bg-slate-100 px-4 py-2 text-left font-semibold text-slate-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-slate-200 px-4 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } else if (line.startsWith('- ')) {
          elements.push(
            <li key={i} className="mb-1 ml-4 leading-relaxed list-disc text-slate-700">
              {line.substring(2)}
            </li>
          );
        } else if (line.trim() === '') {
          const prevElement = elements[elements.length - 1];
          if (prevElement && prevElement.type !== 'li') {
            elements.push(<br key={i} />);
          }
        } else if (line.trim()) {
          elements.push(
            <p key={i} className="mb-3 leading-relaxed text-slate-700">
              {line}
            </p>
          );
        }

        i++;
      }

      return elements;
    };
    return formatContent(content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogPost?.content, p.copy, p.copied]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">{p.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    notFound();
  }

  // Show a translation-available banner when the post language differs from the UI language
  const postLang = blogPost.lang ?? 'nl';
  const showTranslationBanner = postLang !== lang && !!blogPost.translationSlug;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>

          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-blue-400 transition-colors duration-300 hover:text-blue-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {p.backToBlog}
                </Link>
              </div>

              <div className="mb-6">
                <span className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full">
                  {blogPost.category}
                </span>
              </div>

              <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {blogPost.title}
              </h1>

              <p className="max-w-4xl mx-auto mb-6 text-xl leading-relaxed text-slate-200">
                {blogPost.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {blogPost.author}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(blogPost.publishedAt)}
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {p.minRead(blogPost.readTime)}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Translation available banner */}
        {showTranslationBanner && (
          <div className="bg-blue-50 border-b border-blue-100">
            <div className="max-w-5xl px-4 py-3 mx-auto text-sm text-blue-700 sm:px-6 lg:px-8">
              {p.translationBanner}
              <Link href={`/blog/${blogPost.translationSlug}`} className="font-semibold underline hover:text-blue-800">
                {p.translationLinkLabel}
              </Link>
            </div>
          </div>
        )}

        {/* Featured Image */}
        <section className="py-6">
          <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-64 overflow-hidden shadow-2xl md:h-96 rounded-2xl"
            >
              <Image
                src={blogPost.image}
                alt={blogPost.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-6 bg-white shadow-lg rounded-2xl md:p-8"
            >
              <div className="prose prose-lg max-w-none">
                <div className="space-y-2">
                  {formattedContent}
                </div>
              </div>

              {/* Share Buttons */}
              <ShareButtons slug={blogPost.slug} title={blogPost.title} />

              {/* Tags */}
              <div className="pt-6 mt-8 border-t border-slate-200">
                <h4 className="mb-3 text-lg font-semibold text-slate-800">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {blogPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium transition-colors duration-300 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Bio */}
              <div className="pt-6 mt-8 border-t border-slate-200">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-full bg-slate-200">
                    <img
                      src="/images/Profiel.png"
                      alt="Jonas Van Twembeke"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      <a href="/over" className="hover:text-blue-600 transition-colors">Jonas Van Twembeke</a>
                    </p>
                    <p className="text-sm text-slate-500 mb-1">Web Developer &amp; Digital Strategist — IntrICT, Gent</p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Gespecialiseerd in moderne websites (Next.js, React), SEO en GEO voor Belgische bedrijven.{' '}
                      <a
                        href="https://www.linkedin.com/in/VanTwembeke"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 bg-white">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-16 text-center"
              >
                <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
                  {p.relatedHeading}{' '}
                  <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                    {p.relatedHighlight}
                  </span>
                </h2>
                <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                  {p.relatedSubtitle}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="overflow-hidden transition-all duration-300 shadow-lg bg-slate-50 rounded-2xl hover:shadow-xl group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-bold transition-colors duration-300 text-slate-800 line-clamp-2 group-hover:text-blue-600">
                        {post.title}
                      </h3>

                      <p className="mb-4 leading-relaxed text-slate-600 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center font-semibold text-blue-600 transition-colors duration-300 hover:text-blue-700"
                      >
                        {p.readMore}
                        <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                {p.ctaHeading}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  {p.ctaHighlight}
                </span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                {p.ctaBody}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                  >
                    {p.ctaStart}
                  </motion.button>
                </Link>

                <Link href="/portfolio">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                  >
                    {p.ctaPortfolio}
                  </motion.button>
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
