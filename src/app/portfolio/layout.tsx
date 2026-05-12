import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | IntrICT — Web Development in Gent',
  description:
    'Projecten en cases van Jonas Van Twembeke bij IntrICT. Full-stack webapplicaties, SEO-geoptimaliseerde marketingsites, en Next.js innovaties voor Belgische bedrijven.',
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.intrict.com/portfolio',
    title: 'Portfolio | IntrICT — Web Development & Design',
    description:
      'Full-stack webapplicaties en SEO-geoptimaliseerde sites gebouwd met Next.js, React en Supabase door IntrICT in Gent.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
    images: [
      {
        url: 'https://www.intrict.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio | IntrICT',
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
