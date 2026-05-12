import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GDPR & Gegevensbescherming | IntrICT',
  description:
    'Informatie over hoe IntrICT omgaat met persoonsgegevens in lijn met de Europese GDPR-wetgeving (AVG). Uw rechten als betrokkene en onze verplichtingen.',
  alternates: {
    canonical: '/gdpr',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
      { "@type": "ListItem", position: 2, name: "GDPR", item: "https://www.intrict.com/gdpr" },
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
