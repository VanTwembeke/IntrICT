import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'Bekijk de projecten en cases van IntrICT — van full-stack webapplicaties tot SEO-geoptimaliseerde marketingsites gebouwd met Next.js, React en Supabase.',
  alternates: {
    canonical: '/portfolio',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
