'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import PublicChatWidget from '@/components/common/PublicChatWidget';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <PublicChatWidget />
    </LanguageProvider>
  );
}
