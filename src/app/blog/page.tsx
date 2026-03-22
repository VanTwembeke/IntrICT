'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { getAllBlogPosts, BlogPostMeta } from '@/lib/blog-api';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Load blog posts
    const loadBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
          
          <div className="relative z-10 px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                Blog
              </h1>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Tips, inzichten en verhalen over web development en digitale transformatie
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-20">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600">Blogposts laden...</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-16 text-center"
                >
                  <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
                    Laatste <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Artikelen</span>
                  </h2>
                  <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                    Ontdek mijn nieuwste inzichten en tips over web development
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {blogPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 text-sm font-medium rounded-full bg-white/90 backdrop-blur-sm text-slate-800">
                            {post.readTime} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center mb-3 text-sm text-slate-500">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span className="mx-2">•</span>
                          <span>door {post.author}</span>
                        </div>
                        
                        <h3 className="mb-3 text-xl font-bold transition-colors duration-300 text-slate-800 line-clamp-2 group-hover:text-blue-600">
                          {post.title}
                        </h3>
                        
                        <p className="mb-4 leading-relaxed text-slate-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
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

                {blogPosts.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="p-12 bg-white shadow-lg rounded-2xl">
                      <div className="mb-4 text-6xl">📝</div>
                      <h3 className="mb-4 text-2xl font-bold text-slate-800">Geen artikelen gevonden</h3>
                      <p className="mb-6 text-slate-600">Er zijn momenteel geen blogposts beschikbaar.</p>
                      <Link
                        href="/#contact"
                        className="inline-flex items-center px-6 py-3 font-semibold text-white transition-colors duration-300 bg-blue-500 rounded-lg hover:bg-blue-600"
                      >
                        Neem contact op
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Blijf Op De <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Hoogte</span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Ontvang de nieuwste artikelen en tips over web development direct in je inbox
              </p>
              <div className="flex flex-col justify-center max-w-md gap-4 mx-auto sm:flex-row">
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 px-4 py-3 text-white border rounded-lg bg-white/10 border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  Aanmelden
                </motion.button>
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
