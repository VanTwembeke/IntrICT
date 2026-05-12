import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | IntrICT — Web Development & Digital Strategy',
  description:
    'Artikels van Jonas Van Twembeke over moderne webontwikkeling, GEO (Generative Engine Optimization), SEO en digitale strategie voor Belgische bedrijven — van praktijk tot theorie.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.intrict.com/blog',
    title: 'Blog | IntrICT — Web Development & Digital Strategy',
    description: 'Praktische gidsen over web development, GEO, SEO en digitale innovatie door IntrICT.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
    images: [
      {
        url: 'https://www.intrict.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog | IntrICT',
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.intrict.com/blog" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      {children}
    </>
  );
}
