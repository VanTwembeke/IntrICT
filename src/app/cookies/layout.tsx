import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiebeleid | IntrICT',
  description:
    'Het cookiebeleid van IntrICT: welke cookies we gebruiken, waarvoor en hoe u uw voorkeuren kunt beheren.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IntrICT", item: "https://www.intrict.com" },
      { "@type": "ListItem", position: 2, name: "Cookiebeleid", item: "https://www.intrict.com/cookies" },
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
