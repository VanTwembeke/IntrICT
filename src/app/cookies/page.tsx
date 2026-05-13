import type { Metadata } from 'next';
import CookiesClient from './CookiesClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description:
    'Het cookiebeleid van IntrICT: welke cookies we gebruiken, waarvoor en hoe u uw voorkeuren kunt beheren conform de Europese privacywetgeving.',
  alternates: { canonical: '/cookies' },
  robots: { index: true, follow: false },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/cookies`,
    title: 'Cookiebeleid | IntrICT',
    description: 'Welke cookies IntrICT gebruikt en hoe u uw voorkeuren beheert.',
  },
};

export default function CookiesPage() {
  return <CookiesClient />;
}
