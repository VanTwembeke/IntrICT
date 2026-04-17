'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Settings, Shield, Cookie, Eye, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Prefs = {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'cookie-consent';

function Toggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        disabled
          ? 'cursor-not-allowed bg-green-400 opacity-70'
          : enabled
          ? 'cursor-pointer bg-blue-500'
          : 'cursor-pointer bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Allow cookie page to re-open the banner
  useEffect(() => {
    const onReset = () => {
      setPrefs({ essential: true, analytics: false, functional: false, marketing: false });
      setShowSettings(false);
      setIsVisible(true);
    };
    window.addEventListener('cookie-consent-reset', onReset);
    return () => window.removeEventListener('cookie-consent-reset', onReset);
  }, []);

  const save = (p: Prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, timestamp: new Date().toISOString() }));
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, functional: true, marketing: true });
  const rejectAll = () => save({ essential: true, analytics: false, functional: false, marketing: false });
  const saveSelected = () => save(prefs);

  const toggle = (key: keyof Prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  if (!isVisible) return null;

  const categories = [
    {
      key: 'essential' as const,
      label: t.cookies.essential,
      desc: t.cookies.essentialDesc,
      locked: true,
    },
    {
      key: 'analytics' as const,
      label: t.cookies.analytics,
      desc: t.cookies.analyticsDesc,
      locked: false,
    },
    {
      key: 'functional' as const,
      label: t.cookies.functional,
      desc: t.cookies.functionalDesc,
      locked: false,
    },
    {
      key: 'marketing' as const,
      label: t.cookies.marketing,
      desc: t.cookies.marketingDesc,
      locked: false,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 pointer-events-none">
        <motion.div
          key="cookie-banner"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-2xl pointer-events-auto"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

            {!showSettings ? (
              /* ── Compact banner ── */
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                      <Cookie className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.cookies.heading}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {t.cookies.message}{' '}
                        <a href="/cookies" className="underline hover:text-slate-700">
                          Meer info
                        </a>
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-green-500" />
                          {t.cookies.safe}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-500" />
                          {t.cookies.transparent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={rejectAll}
                    className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                    aria-label="Sluit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={acceptAll}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t.cookies.accept}
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {t.cookies.settings}
                  </button>
                  <button
                    onClick={rejectAll}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {t.cookies.essentialOnly}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Settings panel ── */
              <div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 shrink-0">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.cookies.settingsHeading}</p>
                      <p className="text-xs text-slate-500">{t.cookies.settingsSubtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    aria-label="Terug"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.key}
                      className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{cat.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        <Toggle
                          enabled={prefs[cat.key]}
                          disabled={cat.locked}
                          onChange={cat.locked ? undefined : () => toggle(cat.key)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-slate-100">
                  <button
                    onClick={rejectAll}
                    className="text-xs text-slate-500 underline hover:text-slate-700"
                  >
                    {t.cookies.essentialOnly}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      {t.cookies.cancel}
                    </button>
                    <button
                      onClick={saveSelected}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.cookies.save}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
