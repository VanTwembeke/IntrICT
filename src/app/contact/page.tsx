import type { Metadata } from 'next';
import ContactClient from './ContactClient';

const SITE_URL = 'https://www.intrict.com';

export const metadata: Metadata = {
  title: 'Contact — Vrijblijvend Gesprek Starten',
  description:
    'Neem contact op met IntrICT voor een vrijblijvend gesprek over uw website, digitale strategie of ICT-project. Online afspraak plannen of direct een bericht sturen. Snel antwoord gegarandeerd.',
  keywords: [
    'contact IntrICT',
    'web developer contacteren Gent',
    'afspraak plannen website',
    'offerte website België',
    'vrijblijvend gesprek web developer',
    'digitale strategie consult',
  ],
  alternates: {
    canonical: '/contact',
    languages: { 'nl-BE': '/contact', 'x-default': '/contact' },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/contact`,
    title: 'Contact — Vrijblijvend Gesprek Starten | IntrICT',
    description: 'Plan een gesprek of stuur een bericht. IntrICT staat klaar voor uw digitale project.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Contact IntrICT' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact — Vrijblijvend Gesprek Starten | IntrICT',
    description: 'Plan een gesprek of stuur een bericht. IntrICT staat klaar voor uw digitale project.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${SITE_URL}/contact`,
  url: `${SITE_URL}/contact`,
  name: 'Contact IntrICT',
  description: 'Contactpagina van IntrICT — plan een afspraak of stuur een bericht.',
  mainEntity: { '@id': `${SITE_URL}/#organization` },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
    ],
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoe lang duurt het om een website te bouwen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De doorlooptijd hangt af van de complexiteit van het project. Een eenvoudige website is doorgaans klaar binnen 2 à 3 weken. Een uitgebreider project met maatwerk functionaliteiten kan 4 tot 8 weken in beslag nemen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat kost het laten maken van een website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Elke opdracht is uniek, dus ik werk altijd op maat en op offerte-basis. Voor terugkerende ondersteuning bied ik maandelijkse retainer-pakketten aan vanaf €99/maand. Na een gratis kennismakingsgesprek ontvang je een gedetailleerde offerte zonder verborgen kosten.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bied je ook onderhoud en support na oplevering?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absoluut. Ik bied flexibele onderhoudscontracten aan waarbij ik zorg voor updates, beveiliging en technische ondersteuning. Zo blijft jouw website altijd up-to-date en veilig.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan ik mijn website zelf aanpassen na oplevering?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dat is zeker mogelijk. Ik kan een gebruiksvriendelijk CMS instellen zodat je zelf teksten, afbeeldingen en pagina\'s kunt aanpassen. Ik geef ook een korte training zodat je zelfstandig aan de slag kunt.',
      },
    },
    {
      '@type': 'Question',
      name: 'In welke regio werk je?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ik ben gevestigd in Gent (Oost-Vlaanderen) maar werk voor klanten door heel België en Nederland. De meeste samenwerking verloopt online, maar voor een persoonlijk gesprek ben ik ook beschikbaar in de regio Gent.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe verloopt een samenwerking stap voor stap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We starten met een gratis kennismakingsgesprek van 30 minuten. Daarna ontvang je een offerte en planning. Na akkoord start de ontwerp- en ontwikkelfase, met regelmatige updates en feedbackmomenten. Bij oplevering krijg je een werkende, geoptimaliseerde website plus een korte handleiding.',
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
      <ContactClient />
    </>
  );
}
