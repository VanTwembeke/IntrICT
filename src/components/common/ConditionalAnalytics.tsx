'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

type Prefs = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

function pushGTMConsent(prefs: Prefs) {
  if (typeof window === 'undefined') return;
  const dl = (window as typeof window & { dataLayer?: unknown[] }).dataLayer;
  if (!dl) return;
  dl.push({
    event: 'consent_update',
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    functionality_storage: prefs.functional ? 'granted' : 'denied',
    personalization_storage: prefs.marketing ? 'granted' : 'denied',
  });
  // Consent Mode v2 update
  dl.push(function (this: { set: (key: string, val: unknown) => void }) {
    this.set('developer_id.dZTNiMT', true);
  });
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      functionality_storage: prefs.functional ? 'granted' : 'denied',
      personalization_storage: prefs.marketing ? 'granted' : 'denied',
    });
  }
}

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ConditionalAnalytics() {
  // Keep server and hydration output empty; read browser preferences only afterwards.
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  return hydrated ? <ConsentedAnalytics /> : null;
}

function ConsentedAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('cookie-consent');
      return stored ? (JSON.parse(stored) as Prefs).analytics ?? false : false;
    } catch { return false; }
  });

  useEffect(() => {
    // Lees opgeslagen voorkeur bij mount
    try {
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        const parsed = JSON.parse(stored) as Prefs;
        const prefs: Prefs = {
          analytics: parsed.analytics ?? false,
          functional: parsed.functional ?? false,
          marketing: parsed.marketing ?? false,
        };
        pushGTMConsent(prefs);
      }
    } catch { /* malformed — ignore */ }

    // Luister naar wijzigingen via de cookie banner
    const onSave = (e: Event) => {
      const detail = (e as CustomEvent<Prefs>).detail;
      const prefs: Prefs = {
        analytics: detail.analytics ?? false,
        functional: detail.functional ?? false,
        marketing: detail.marketing ?? false,
      };
      pushGTMConsent(prefs);
      setAnalyticsEnabled(prefs.analytics);
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
