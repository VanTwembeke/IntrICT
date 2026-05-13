import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import Pricing from '@/components/home/Pricing';
import Contact from '@/components/home/Contact';
import BlogPostNotification from '@/components/home/BlogPostNotification';
import LatestNews from '@/components/home/LatestNews';
import BackToTop from '@/components/common/BackToTop';
import HomeEffects from './HomeEffects';
import { blogPosts } from '@/data/blog-posts';
import { blogPostsEn } from '@/data/blog-posts/en';
import { createClient } from '@/lib/supabase/server';
import type { Package } from '@/lib/types';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'IntrICT — Moderne websites die werken',
  description:
    'IntrICT bouwt snelle, toegankelijke websites en Next.js apps voor bedrijven in België en Nederland. Retainerformules vanaf €99/maand, inclusief SEO en onderhoud.',
  keywords: [
    'web developer Gent',
    'website laten maken België',
    'Next.js developer België',
    'React developer Gent',
    'webdesign Oost-Vlaanderen',
    'SEO optimalisatie België',
    'webshop maken',
    'website retainer',
    'UI UX design',
    'freelance web developer België',
    'website onderhoud',
    'digitale strategie KMO',
    'IntrICT',
  ],
  alternates: {
    canonical: '/',
    languages: { 'nl-BE': '/', 'en': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'IntrICT — Moderne websites die werken',
    description:
      'Snelle, toegankelijke websites en Next.js apps voor Belgische en Nederlandse bedrijven. Retainerformules vanaf €99/maand.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'IntrICT — Web development studio Gent' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntrICT — Moderne websites die werken',
    description: 'Snelle, toegankelijke websites en Next.js apps voor Belgische en Nederlandse bedrijven.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  ],
};

export default async function Home() {
  let monthlyPackages: Package[] = [];
  let oneTimePackages: Package[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    const all = (data ?? []) as Package[];
    monthlyPackages = all.filter((p) => p.billing_interval === 'monthly');
    oneTimePackages = all.filter((p) => p.billing_interval === 'one_time');
  } catch { /* packages not accessible — section hidden */ }

  const sortedNl = [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const sortedEn = [...blogPostsEn]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const latestPost = sortedNl[0];
  const { content: _content, ...latestPostMeta } = latestPost;
  const newsPostsNl = sortedNl.slice(0, 4).map(({ content: _c, ...meta }) => meta);
  const newsPostsEn = sortedEn.slice(0, 4).map(({ content: _c, ...meta }) => meta);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HomeEffects />
        <Header />
        <main id="main-content">
          <Hero />
          <LatestNews postsNl={newsPostsNl} postsEn={newsPostsEn} />
          <Services />
          <Process />
          <Pricing monthlyPackages={monthlyPackages} oneTimePackages={oneTimePackages} />
          <BlogPostNotification post={latestPostMeta} />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  );
}
