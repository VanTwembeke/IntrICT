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
    images: [
      {
        url: 'https://www.intrict.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact IntrICT',
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
      { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.intrict.com/contact" },
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
