import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GDPR & Gegevensbescherming',
  description:
    'Informatie over hoe IntrICT omgaat met persoonsgegevens in lijn met de Europese GDPR-wetgeving (AVG). Uw rechten als betrokkene en onze verplichtingen.',
  alternates: {
    canonical: '/gdpr',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
