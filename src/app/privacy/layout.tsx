import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid | IntrICT',
  description:
    'Het privacybeleid van IntrICT: hoe wij uw persoonsgegevens verzamelen, verwerken en beschermen conform de AVG/GDPR.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
      { "@type": "ListItem", position: 2, name: "Privacybeleid", item: "https://www.intrict.com/privacy" },
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
