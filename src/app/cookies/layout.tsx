import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description:
    'Het cookiebeleid van IntrICT: welke cookies we gebruiken, waarvoor en hoe u uw voorkeuren kunt beheren.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
