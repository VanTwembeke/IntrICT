import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import CookieConsent from "@/components/common/CookieConsent";
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
  "IntrICT — Gent-gebaseerde web developer gespecialiseerd in moderne websites, " +
  "Next.js webapplicaties, UI/UX design, SEO-optimalisatie en digitale strategie " +
  "voor bedrijven in België en Nederland.";
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
    email: "help@intrict.com",
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

        {children}
        <CookieConsent />
        <Analytics />
        <SpeedInsights />

        {/* Facebook Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1921359905233630');fbq('track','PageView');`}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1921359905233630&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        </Providers>
      </body>
    </html>
  );
}