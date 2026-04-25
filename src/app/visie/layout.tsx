import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onze visie',
  description:
    'De aanpak en waarden van IntrICT: waarom wij kiezen voor kwaliteit boven kwantiteit, snelle websites, eerlijke prijzen en langdurige samenwerking.',
  alternates: {
    canonical: '/visie',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
