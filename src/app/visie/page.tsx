import type { Metadata } from 'next';
import VisieClient from './VisieClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Visie — Onze Aanpak en Waarden',
  description:
    'De visie van IntrICT: transparante samenwerking, meetbare resultaten en langdurige klantrelaties. Ontdek hoe we digitale projecten aanpakken en waarom kwaliteit centraal staat.',
  keywords: [
    'visie web developer',
    'aanpak webontwikkeling',
    'transparante samenwerking',
    'digitale strategie waarden',
    'IntrICT missie',
    'kwaliteit webdesign',
  ],
  alternates: {
    canonical: '/visie',
    languages: { 'nl-BE': '/visie', 'x-default': '/visie' },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/visie`,
    title: 'Visie — Onze Aanpak en Waarden | IntrICT',
    description: 'Transparante samenwerking, meetbare resultaten en langdurige klantrelaties — de visie van IntrICT.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'IntrICT Visie' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visie — Onze Aanpak en Waarden | IntrICT',
    description: 'Transparante samenwerking, meetbare resultaten en langdurige klantrelaties — de visie van IntrICT.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const visieJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/visie`,
  url: `${SITE_URL}/visie`,
  name: 'Visie van IntrICT',
  description: 'De aanpak, waarden en werkwijze van IntrICT — web development studio in Gent.',
  about: { '@id': `${SITE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Visie', item: `${SITE_URL}/visie` },
    ],
  },
};

export default function VisiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visieJsonLd).replace(/</g, '\\u003c') }} />
      <VisieClient />
    </>
  );
}
