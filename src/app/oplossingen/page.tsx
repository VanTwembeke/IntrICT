import type { Metadata } from 'next';
import OplossClient from './OplossClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Oplossingen — Webontwikkeling & Digitale Diensten',
  description:
    'Alle digitale oplossingen van IntrICT: website-lancering, mini apps, AI-infosessies, ICT-workshops, GDPR-compliance, technisch advies en API-ontwikkeling voor Belgische bedrijven.',
  keywords: [
    'webontwikkeling België',
    'website laten maken Gent',
    'mini app ontwikkeling',
    'AI infosessie bedrijven',
    'ICT workshop',
    'GDPR compliance website',
    'technisch ICT advies',
    'API ontwikkeling',
    'digitale oplossingen KMO',
    'Next.js website',
    'IntrICT oplossingen',
  ],
  alternates: {
    canonical: '/oplossingen',
    languages: { 'nl-BE': '/oplossingen', 'x-default': '/oplossingen' },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/oplossingen`,
    title: 'Oplossingen — Webontwikkeling & Digitale Diensten | IntrICT',
    description:
      'Van website-lancering tot AI-infosessies en GDPR-compliance: ontdek alle digitale diensten van IntrICT voor bedrijven in België en Nederland.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'IntrICT Oplossingen' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oplossingen — Webontwikkeling & Digitale Diensten | IntrICT',
    description: 'Van website-lancering tot AI-infosessies: alle digitale diensten van IntrICT voor Belgische bedrijven.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${SITE_URL}/oplossingen#diensten`,
  name: 'IntrICT Digitale Diensten',
  description: 'Overzicht van alle webontwikkeling en digitale diensten van IntrICT',
  provider: { '@id': `${SITE_URL}/#organization` },
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Website Lancering', description: 'End-to-end ontwerp & ontwikkeling van een professionele website, tot 6 pagina\'s op maat, inclusief SEO en 30 dagen nazorg.' },
    { '@type': 'ListItem', position: 2, name: 'Mini App Ontwikkeling', description: 'Kleine, gerichte applicaties die één specifiek bedrijfsprobleem oplossen: automatisering, integraties en workflowoptimalisatie.' },
    { '@type': 'ListItem', position: 3, name: 'AI-Infosessie', description: 'Presentatie op maat voor uw sector over praktische AI-tools, live demo en interactieve Q&A voor tot 15 deelnemers.' },
    { '@type': 'ListItem', position: 4, name: 'ICT-Workshop', description: 'Hands-on workshop van 3 tot 4 uur voor uw team met praktijkcases, documentatie en 1 maand follow-up.' },
    { '@type': 'ListItem', position: 5, name: 'GDPR Compliance', description: 'Privacy-audit, cookieconsent-implementatie en documentatie conform Belgische en Europese privacywetgeving.' },
    { '@type': 'ListItem', position: 6, name: 'Strategisch ICT-Advies', description: 'Analyse van uw huidige ICT-situatie, gepersonaliseerde digitale roadmap en technologieselectie.' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Welke gespecialiseerde webdiensten biedt IntrICT aan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IntrICT biedt mini app-ontwikkeling, technisch advies, AI-infosessies, systeemoptimalisatie, beveiligingsaudits, GDPR-compliance en maatwerk API-ontwikkeling.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is een mini app en wanneer is het nuttig?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een mini app is een kleine, gerichte applicatie die één specifiek bedrijfsprobleem oplost, zoals automatisering, dataverwerking of workflowoptimalisatie. Ze zijn snel te ontwikkelen en eenvoudig te onderhouden.',
      },
    },
    {
      '@type': 'Question',
      name: 'Helpt IntrICT met GDPR-compliance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. IntrICT biedt GDPR-compliance ondersteuning inclusief privacy-audits, cookieconsent-implementatie en documentatie conform Belgische en Europese privacywetgeving.',
      },
    },
    {
      '@type': 'Question',
      name: 'Zijn er betaalbare opties voor kleine bedrijven of starters?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. IntrICT biedt een gratis eerste gesprek en flexibele tarieven voor kleine websites en projecten. Elke samenwerking start met een vrijblijvend gesprek.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Oplossingen', item: `${SITE_URL}/oplossingen` },
  ],
};

export default function OplossPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <OplossClient />
    </>
  );
}
