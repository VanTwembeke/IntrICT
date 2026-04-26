import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/common/CookieConsent";
import FacebookPixel from "@/components/common/FacebookPixel";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", 
});

const SITE_URL = "https://www.intrict.com";
const SITE_NAME = "IntrICT";
const SITE_DESCRIPTION =
  "IntrICT — web developer in Gent. Moderne websites, Next.js apps, UI/UX design " +
  "en SEO-optimalisatie voor bedrijven in België en Nederland.";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`; // place a 1200×630 image here

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — Moderne websites die werken`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  keywords: [
    "web developer Gent",
    "website laten maken België",
    "Next.js developer",
    "React developer Gent",
    "webdesign Oost-Vlaanderen",
    "SEO optimalisatie",
    "webshop maken",
    "UI UX design",
    "freelance web developer",
    "website onderhoud",
    "TypeScript developer",
    "Tailwind CSS",
    "digitale strategie",
    "IntrICT",
  ],

  authors: [{ name: "IntrICT", url: SITE_URL }],
  creator: "IntrICT",
  publisher: "IntrICT",

  alternates: {
    canonical: "/",
    languages: {
      "nl-BE": "/",
      "x-default": "/",
    },
  },

  // ── Open Graph (LinkedIn, Facebook, WhatsApp previews) ───────────────────
  openGraph: {
    type: "website",
    locale: "nl_BE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Moderne websites die werken`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "IntrICT — Web development studio in Gent",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Moderne websites die werken`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    // creator: "@xhandle", 
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Verification placeholders ────────────────────────────────────────────
  // verification: {
  //   google: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  //   other: { "msvalidate.01": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  // },

  category: "technology",
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "IntrICT Web Development",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  image: OG_IMAGE,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gent",
    addressRegion: "Oost-Vlaanderen",
    addressCountry: "BE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.0543,
    longitude: 3.7174,
  },
  areaServed: [
    { "@type": "Country", name: "België" },
    { "@type": "Country", name: "Nederland" },
  ],
  serviceType: [
    "Website Ontwikkeling",
    "Next.js Development",
    "UI/UX Design",
    "SEO Optimalisatie",
    "E-commerce Ontwikkeling",
    "Technische Ondersteuning",
    "Logo & Branding",
    "Digitale Strategie",
  ],
  foundingDate: "2026",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Dutch", "English"],
    email: "info@intrict.com",
  },
  sameAs: [
    "https://www.linkedin.com/in/VanTwembeke",
    "https://github.com/VanTwembeke",
  ],
  priceRange: "€€",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".excerpt", "article p:first-of-type"],
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#founder`,
  name: 'Jonas Van Twembeke',
  url: `${SITE_URL}/over`,
  image: `${SITE_URL}/images/Profiel.png`,
  jobTitle: 'Web Developer & Digital Strategist',
  worksFor: { '@id': `${SITE_URL}/#organization` },
  sameAs: [
    'https://www.linkedin.com/in/VanTwembeke',
    'https://github.com/VanTwembeke',
  ],
  knowsAbout: [
    'Next.js',
    'React',
    'TypeScript',
    'UI/UX Design',
    'SEO Optimization',
    'Digital Strategy',
    'Web Development',
  ],
  knowsLanguage: ['Dutch', 'English'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gent',
    addressRegion: 'Oost-Vlaanderen',
    addressCountry: 'BE',
  },
};

const offerCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "@id": `${SITE_URL}/#services`,
  name: "IntrICT Dienstenaanbod",
  provider: { "@id": `${SITE_URL}/#organization` },
  itemListElement: [
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-basic`,
      name: "Basic Retainer",
      description: "8 uren/maand inbegrepen, flexibele inzet, webontwikkeling & onderhoud, persoonlijke begeleiding, maandelijkse voortgangsrapportage. Extra uren aan €85/uur.",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 99,
        priceCurrency: "EUR",
        unitCode: "MON",
        unitText: "per maand",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-standard`,
      name: "Standard Retainer",
      description: "16 uren/maand inbegrepen, prioritaire ondersteuning, strategisch ICT-advies, maandelijkse voortgangsrapportage. Extra uren aan €75/uur. Meest gekozen formule.",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 199,
        priceCurrency: "EUR",
        unitCode: "MON",
        unitText: "per maand",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-premium`,
      name: "Premium Retainer",
      description: "32 uren/maand inbegrepen, volledige maandelijkse beschikbaarheid, prioritaire ondersteuning, strategisch ICT-advies, dedicated persoonlijke begeleiding. Extra uren aan €65/uur.",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 399,
        priceCurrency: "EUR",
        unitCode: "MON",
        unitText: "per maand",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-website`,
      name: "Website Lancering",
      description: "End-to-end ontwerp & ontwikkeling, tot 6 pagina's op maat, responsief design, contactformulier, SSL, Google Analytics, deployment & domeinconfiguratie, 30 dagen nazorg.",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 749,
        priceCurrency: "EUR",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-advies`,
      name: "Strategisch ICT-Advies",
      description: "Analyse van huidige ICT-situatie, gepersonaliseerde digitale roadmap, technologieselectie & aanbevelingen, 2 uur sessie (online of ter plaatse), schriftelijk rapport, 2 weken opvolgingssupport.",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 195,
        priceCurrency: "EUR",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-ai`,
      name: "AI-Infosessie",
      description: "Presentatie van 2 tot 3 uur, aangepast aan jouw sector, live demo van praktische AI-tools, interactieve Q&A, samenvatting & bronnenlijst achteraf, tot 15 deelnemers inbegrepen.",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 295,
        priceCurrency: "EUR",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Offer",
      "@id": `${SITE_URL}/#offer-workshop`,
      name: "ICT-Workshop",
      description: "Workshop van 3 tot 4 uur, volledig op maat van jouw team, hands-on oefeningen & praktijkcases, documentatie & handleidingen inbegrepen, follow-up via e-mail (1 maand), tot 10 deelnemers.",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 395,
        priceCurrency: "EUR",
      },
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "nl-BE",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl-BE">
      <body className={`${geistMono.variable} font-mono antialiased`}>
        <Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(offerCatalogJsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {children}
        <CookieConsent />
        <FacebookPixel />
        <Analytics />
        <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}