import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | IntrICT',
  description:
    'De algemene voorwaarden van IntrICT BV — van toepassing op alle overeenkomsten voor web development, design en gerelateerde diensten.',
  alternates: {
    canonical: '/voorwaarden',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
      { "@type": "ListItem", position: 2, name: "Voorwaarden", item: "https://www.intrict.com/voorwaarden" },
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
