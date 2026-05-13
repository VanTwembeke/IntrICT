import type { Metadata } from 'next';
import GdprClient from './GdprClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'GDPR & AVG — Uw Rechten',
  description:
    'IntrICT respecteert uw rechten onder de AVG/GDPR. Lees hoe u inzage, correctie of verwijdering van uw persoonsgegevens kunt aanvragen.',
  alternates: { canonical: '/gdpr' },
  robots: { index: true, follow: false },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/gdpr`,
    title: 'GDPR & AVG — Uw Rechten | IntrICT',
    description: 'Uw rechten onder de AVG/GDPR en hoe IntrICT deze respecteert.',
  },
};

export default function GdprPage() {
  return <GdprClient />;
}
