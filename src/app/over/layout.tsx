import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over IntrICT',
  description:
    'Leer IntrICT kennen — een Gents web development studio gespecialiseerd in moderne websites, webapplicaties en digitale strategie voor Belgische bedrijven.',
  alternates: {
    canonical: '/over',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
