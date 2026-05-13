import type { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Portfolio — Gerealiseerde Projecten',
  description:
    'Bekijk de gerealiseerde projecten van IntrICT: van volledige Next.js-platformen met klantendashboard en facturatie tot maatwerk webapplicaties voor Belgische bedrijven.',
  keywords: [
    'portfolio web developer België',
    'Next.js projecten',
    'webapplicaties Gent',
    'klantendashboard ontwikkeling',
    'maatwerk website',
    'React projecten België',
    'IntrICT portfolio',
  ],
  alternates: {
    canonical: '/portfolio',
    languages: { 'nl-BE': '/portfolio', 'x-default': '/portfolio' },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/portfolio`,
    title: 'Portfolio — Gerealiseerde Projecten | IntrICT',
    description: 'Van Next.js-platformen tot maatwerk webapplicaties — bekijk wat IntrICT heeft gebouwd voor Belgische bedrijven.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'IntrICT Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio — Gerealiseerde Projecten | IntrICT',
    description: 'Van Next.js-platformen tot maatwerk webapplicaties — bekijk het portfolio van IntrICT.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const portfolioJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/portfolio`,
  url: `${SITE_URL}/portfolio`,
  name: 'IntrICT Portfolio',
  description: 'Overzicht van gerealiseerde webontwikkelingsprojecten door IntrICT',
  creator: { '@id': `${SITE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${SITE_URL}/portfolio` },
    ],
  },
  hasPart: [
    {
      '@type': 'CreativeWork',
      name: 'IntrICT.com — Volledig platform',
      description:
        'Next.js 16, React 19, Tailwind CSS v4, Supabase, Vercel. Klantendashboard, factuurmodule, berichtencentrum, afsprakensysteem en GEO/SEO-geoptimaliseerde publieke website.',
      url: SITE_URL,
      creator: { '@id': `${SITE_URL}/#organization` },
      keywords: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS'],
    },
  ],
};

export default function PortfolioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioJsonLd).replace(/</g, '\\u003c') }} />
      <PortfolioClient />
    </>
  );
}
