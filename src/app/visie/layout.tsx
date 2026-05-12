import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onze Visie | IntrICT — Kwaliteit Boven Kwantiteit',
  description:
    'De missie en waarden van IntrICT: waarom Jonas Van Twembeke kiest voor kwaliteit, performance, transparante prijzen en langetermijnpartnership met Belgische bedrijven.',
  alternates: {
    canonical: '/visie',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.intrict.com/visie',
    title: 'Onze Visie | IntrICT',
    description: 'De filosofie van IntrICT: kwaliteit, performance, transparantie en langdurige samenwerking.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
    images: [
      {
        url: 'https://www.intrict.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Onze Visie | IntrICT',
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
      { "@type": "ListItem", position: 2, name: "Visie", item: "https://www.intrict.com/visie" },
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
