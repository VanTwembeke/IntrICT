import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description:
    'Het privacybeleid van IntrICT: hoe wij uw persoonsgegevens verzamelen, verwerken en beschermen conform de AVG/GDPR.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
