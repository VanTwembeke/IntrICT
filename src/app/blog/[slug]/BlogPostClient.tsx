'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Lenis from 'lenis';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { getBlogPostBySlug, getRelatedPosts, BlogPost, BlogPostMeta } from '@/lib/blog-api';

// CodeBlock Component
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
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
                <span>Gekopieerd!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Kopiëren</span>
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

export default function BlogPostClient() {
  const params = useParams();
  const slug = params.slug as string;

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostMeta[]>([]);  // ← Fixed: BlogPostMeta[]
  const [loading, setLoading] = useState(true);

  // Smooth scroll — isolated with cleanup to prevent memory leaks
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Load static blog data (no real async work — just array lookups)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const post = await getBlogPostBySlug(slug);
        if (cancelled) return;
        if (!post) { notFound(); return; }
        setBlogPost(post);
        const related = await getRelatedPosts(slug);
        if (!cancelled) setRelatedPosts(related);
      } catch {
        if (!cancelled) notFound();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

      // Headers
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
        // Code block
        const language = line.substring(3).trim() || 'text';
        const codeLines: string[] = [];
        i++;

        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }

        const code = codeLines.join('\n');
        elements.push(
          <div key={i} className="my-4">
            <CodeBlock code={code} language={language} />
          </div>
        );
      } else if (line.startsWith('https://www.youtube.com/watch?v=') || line.startsWith('https://youtu.be/')) {
        // YouTube video
        const videoId = extractYouTubeVideoId(line);
        if (videoId) {
          elements.push(
            <div key={i} className="my-6">
              <YouTubeEmbed videoId={videoId} />
            </div>
          );
        }
      } else if (line.startsWith('- ')) {
        // List item
        elements.push(
          <li key={i} className="mb-1 ml-4 leading-relaxed list-disc text-slate-700">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === '') {
        // Empty line - only add break if previous element wasn't a list item
        const prevElement = elements[elements.length - 1];
        if (prevElement && prevElement.type !== 'li') {
          elements.push(<br key={i} />);
        }
      } else if (line.trim()) {
        // Regular paragraph
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
  }, [blogPost?.content]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Blogpost laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost) {
    notFound();
  }

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
                  Terug naar Blog
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
                  {blogPost.readTime} min lezen
                </div>
              </div>
            </motion.div>
          </div>
        </section>

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
                  Gerelateerde <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Artikelen</span>
                </h2>
                <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                  Meer interessante artikelen die je mogelijk interessant vindt
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
                        Lees meer
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
                Vond Je Dit <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Interessant?</span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Laten we samenwerken aan jouw volgende project. Ik help je graag met web development, design en digitale strategie.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/contact">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
  >
    Start Je Project
  </motion.button>
</Link>

<Link href="/portfolio">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
  >
    Bekijk Portfolio
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