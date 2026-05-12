import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gespecialiseerde Webdiensten | IntrICT',
  description:
    'IntrICT biedt gespecialiseerde webdiensten: mini-apps, GDPR compliance, AI-trainingen, systeemoptimalisaties, API-integraties en ICT-strategisch advies voor Belgische KMO’s.',
  alternates: {
    canonical: '/oplossingen',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.intrict.com/oplossingen',
    title: 'Gespecialiseerde Webdiensten | IntrICT',
    description: 'Mini-apps, GDPR compliance, API-integraties en strategisch ICT-advies van web developer Jonas Van Twembeke.',
    locale: 'nl_BE',
    siteName: 'IntrICT',
    images: [
      {
        url: 'https://www.intrict.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gespecialiseerde Webdiensten',
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
      { "@type": "ListItem", position: 2, name: "Oplossingen", item: "https://www.intrict.com/oplossingen" },
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
