import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over Jonas Van Twembeke | IntrICT',
  description:
    'Leer Jonas Van Twembeke kennen — web developer uit Oost-Vlaanderen gespecialiseerd in moderne websites, Next.js webapplicaties en digitale strategie voor Belgische bedrijven.',
  alternates: {
    canonical: '/over',
  },
  openGraph: {
    type: 'profile',
    url: 'https://www.intrict.com/over',
    title: 'Over Jonas Van Twembeke | IntrICT',
    description:
      'Leer Jonas Van Twembeke kennen — web developer uit Oost-Vlaanderen gespecialiseerd in moderne websites, Next.js webapplicaties en digitale strategie voor Belgische bedrijven.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
