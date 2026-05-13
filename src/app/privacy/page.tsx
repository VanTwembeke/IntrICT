import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description:
    'Lees het privacybeleid van IntrICT. Hoe we uw persoonsgegevens verzamelen, verwerken en beschermen conform de AVG/GDPR.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: false },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/privacy`,
    title: 'Privacybeleid | IntrICT',
    description: 'Hoe IntrICT uw persoonsgegevens verwerkt en beschermt conform AVG/GDPR.',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
