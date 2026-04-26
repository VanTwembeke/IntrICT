'use client';

import { useEffect } from 'react';

const PIXEL_ID = '1921359905233630';
const STORAGE_KEY = 'cookie-consent';

function initPixel() {
  if (typeof window === 'undefined') return;
  // Already loaded
  if ((window as typeof window & { fbq?: unknown }).fbq) return;

  const f = window as typeof window & {
    fbq: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      version: string;
      push: (...args: unknown[]) => void;
      _fbq?: unknown;
    };
    _fbq?: unknown;
  };

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as typeof f.fbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  f.fbq = fbq;
  if (!f._fbq) f._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);

  f.fbq('init', PIXEL_ID);
  f.fbq('track', 'PageView');
}

function hasMarketingConsent(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const prefs = JSON.parse(stored) as { marketing?: boolean };
    return prefs.marketing === true;
  } catch {
    return false;
  }
}

export default function FacebookPixel() {
  useEffect(() => {
    // Check consent on mount
    if (hasMarketingConsent()) {
      initPixel();
    }

    // Listen for consent updates from CookieConsent banner
    const onConsentUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ marketing: boolean }>).detail;
      if (detail?.marketing) {
        initPixel();
      }
    };

    window.addEventListener('cookie-consent-saved', onConsentUpdate);
    return () => window.removeEventListener('cookie-consent-saved', onConsentUpdate);
  }, []);

  return null;
}
