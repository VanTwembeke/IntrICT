import type { Metadata } from 'next';
import OverClient from './OverClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Over Jonas Van Twembeke — Web Developer Gent',
  description:
    'Leer Jonas Van Twembeke kennen: freelance web developer en digitaal strateeg gevestigd in Gent. Gespecialiseerd in Next.js, React, TypeScript, UI/UX design en SEO voor Belgische bedrijven.',
  keywords: [
    'Jonas Van Twembeke',
    'web developer Gent',
    'freelance developer België',
    'Next.js developer',
    'React developer Oost-Vlaanderen',
    'TypeScript developer',
    'UI UX designer België',
    'digitale strateeg',
    'IntrICT oprichter',
  ],
  alternates: {
    canonical: '/over',
    languages: { 'nl-BE': '/over', 'x-default': '/over' },
  },
  openGraph: {
    type: 'profile',
    url: `${SITE_URL}/over`,
    title: 'Over Jonas Van Twembeke — Web Developer Gent',
    description:
      'Freelance web developer en digitaal strateeg in Gent. Bouwt snelle, toegankelijke Next.js-websites voor Belgische en Nederlandse bedrijven.',
    images: [{ url: `${SITE_URL}/images/Profiel.png`, width: 800, height: 800, alt: 'Jonas Van Twembeke — Web Developer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Over Jonas Van Twembeke — Web Developer Gent',
    description: 'Freelance web developer en digitaal strateeg in Gent. Gespecialiseerd in Next.js, React en SEO.',
    images: [`${SITE_URL}/images/Profiel.png`],
  },
};

const personPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/over`,
  url: `${SITE_URL}/over`,
  name: 'Over Jonas Van Twembeke',
  mainEntity: {
    '@type': 'Person',
    '@id': `${SITE_URL}/#founder`,
    name: 'Jonas Van Twembeke',
    url: `${SITE_URL}/over`,
    image: `${SITE_URL}/images/Profiel.png`,
    jobTitle: 'Web Developer & Digital Strategist',
    description:
      'Freelance web developer en digitaal strateeg in Gent. Gespecialiseerd in Next.js, React, TypeScript, UI/UX en SEO.',
    worksFor: { '@type': 'Organization', '@id': `${SITE_URL}/#organization` },
    knowsAbout: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'UI/UX Design', 'SEO', 'Web Development', 'Digital Strategy'],
    knowsLanguage: ['Dutch', 'English'],
    sameAs: [
      'https://www.linkedin.com/in/VanTwembeke',
      'https://github.com/VanTwembeke',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gent',
      addressRegion: 'Oost-Vlaanderen',
      addressCountry: 'BE',
    },
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Over', item: `${SITE_URL}/over` },
    ],
  },
};

export default function OverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personPageJsonLd).replace(/</g, '\\u003c') }}
      />
      <OverClient />
    </>
  );
}
