import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description:
    'De algemene voorwaarden van IntrICT BV — van toepassing op alle overeenkomsten voor web development, design en gerelateerde diensten.',
  alternates: {
    canonical: '/voorwaarden',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
