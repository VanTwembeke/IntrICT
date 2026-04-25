import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact IntrICT — Gratis kennismakingsgesprek',
  description:
    'Neem contact op met IntrICT voor een vrijblijvend gesprek over uw website, webapplicatie of digitaal project. Gevestigd in Gent, actief in heel België.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.intrict.com/contact',
    title: 'Contact IntrICT — Gratis kennismakingsgesprek',
    description:
      'Neem contact op met IntrICT voor een vrijblijvend gesprek over uw website, webapplicatie of digitaal project. Gevestigd in Gent, actief in heel België.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
