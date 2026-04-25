import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Neem contact op met IntrICT voor een vrijblijvend gesprek over uw website, webapplicatie of digitaal project. Gevestigd in Gent, actief in heel België.',
  alternates: {
    canonical: '/contact',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
