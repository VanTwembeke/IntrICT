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
    images: [
      {
        url: 'https://www.intrict.com/images/Profiel.png',
        width: 400,
        height: 400,
        alt: 'Jonas Van Twembeke | IntrICT',
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
      { "@type": "ListItem", position: 2, name: "Over", item: "https://www.intrict.com/over" },
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
