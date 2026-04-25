import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oplossingen',
  description:
    'Ontdek het volledige dienstenaanbod van IntrICT: webdesign, Next.js webapplicaties, SEO-optimalisatie, dashboards, e-commerce en digitale strategie op maat.',
  alternates: {
    canonical: '/oplossingen',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
