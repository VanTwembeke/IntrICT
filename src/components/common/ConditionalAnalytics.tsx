'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

type Prefs = { analytics: boolean };

export default function ConditionalAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Lees opgeslagen voorkeur
    try {
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        const parsed = JSON.parse(stored) as Prefs;
        setAnalyticsEnabled(parsed.analytics ?? false);
      }
    } catch { /* malformed — ignore */ }

    // Luister naar wijzigingen via de cookie banner
    const onSave = (e: Event) => {
      const detail = (e as CustomEvent<Prefs>).detail;
      setAnalyticsEnabled(detail.analytics ?? false);
    };
    window.addEventListener('cookie-consent-saved', onSave);
    return () => window.removeEventListener('cookie-consent-saved', onSave);
  }, []);

  if (!analyticsEnabled) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
