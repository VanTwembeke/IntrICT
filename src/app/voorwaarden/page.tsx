import type { Metadata } from 'next';
import VoorwaardenClient from './VoorwaardenClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description:
    'De algemene voorwaarden van IntrICT voor webontwikkeling, consulting en digitale dienstverlening. Van toepassing op alle overeenkomsten met IntrICT.',
  alternates: { canonical: '/voorwaarden' },
  robots: { index: true, follow: false },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/voorwaarden`,
    title: 'Algemene Voorwaarden | IntrICT',
    description: 'Algemene voorwaarden voor webontwikkeling en digitale diensten van IntrICT.',
  },
};

export default function VoorwaardenPage() {
  return <VoorwaardenClient />;
}
