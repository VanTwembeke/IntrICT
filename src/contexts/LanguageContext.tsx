'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Lang, type Translations } from '@/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'nl',
  setLang: () => {},
  t: translations.nl,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('nl');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang') as Lang | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === 'nl' || stored === 'en') setLangState(stored);
    } catch { /* */ }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch { /* */ }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
