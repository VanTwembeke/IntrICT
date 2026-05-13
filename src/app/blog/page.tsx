import type { Metadata } from 'next';
import BlogClient from './BlogClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Blog — Inzichten over Web, AI & Digitale Strategie',
  description:
    'Lees de laatste artikelen van IntrICT over webontwikkeling, Next.js, AI-tools, SEO, GEO en digitale strategie voor Belgische en Nederlandse ondernemers.',
  keywords: [
    'blog web developer',
    'Next.js artikelen',
    'AI tools voor bedrijven',
    'SEO tips België',
    'GEO generative engine optimization',
    'digitale strategie blog',
    'webontwikkeling nieuws',
    'IntrICT blog',
  ],
  alternates: {
    canonical: '/blog',
    languages: { 'nl-BE': '/blog', 'en': '/blog', 'x-default': '/blog' },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'Blog — Inzichten over Web, AI & Digitale Strategie | IntrICT',
    description: 'Artikelen over webontwikkeling, Next.js, AI-tools, SEO en digitale strategie voor Belgische ondernemers.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'IntrICT Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Inzichten over Web, AI & Digitale Strategie | IntrICT',
    description: 'Artikelen over webontwikkeling, Next.js, AI-tools en digitale strategie.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${SITE_URL}/blog`,
  url: `${SITE_URL}/blog`,
  name: 'IntrICT Blog',
  description: 'Inzichten en artikelen over webontwikkeling, AI, SEO en digitale strategie door Jonas Van Twembeke.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  author: { '@id': `${SITE_URL}/#founder` },
  inLanguage: ['nl-BE', 'en'],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  },
};

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd).replace(/</g, '\\u003c') }} />
      <BlogClient />
    </>
  );
}
