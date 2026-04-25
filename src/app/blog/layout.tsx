import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Praktische artikels over web development, Next.js, SEO, GEO en digitale strategie — geschreven door het IntrICT team vanuit Gent.',
  alternates: {
    canonical: '/blog',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
