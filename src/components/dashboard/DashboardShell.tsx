'use client';

import { createContext, useContext, useState } from 'react';
import { Eye } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import DashboardBreadcrumbs from './DashboardBreadcrumbs';
import ChatWidget from './ChatWidget';
import { ChatProvider } from '@/contexts/ChatContext';
import type { Profile } from '@/lib/types';

// ─── View-mode context ────────────────────────────────────────────────────────

export type ViewMode = 'admin' | 'user';

interface ViewModeContextType {
  viewAs: ViewMode;
  setViewAs: (v: ViewMode) => void;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  viewAs: 'admin',
  setViewAs: () => {},
});

export const useViewMode = () => useContext(ViewModeContext);

// ─── Preview banner ───────────────────────────────────────────────────────────

function UserPreviewBanner({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 bg-amber-400 text-amber-950 text-sm font-semibold">
      <Eye size={15} />
      <span>Je bekijkt het dashboard als een gewone gebruiker</span>
      <button
        onClick={onExit}
        className="min-h-11 px-3 py-2 rounded-lg bg-amber-950/15 hover:bg-amber-950/25 transition-colors text-xs font-bold"
      >
        Terug naar admin
      </button>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface Props {
  profile: Profile;
  children: React.ReactNode;
}

export default function DashboardShell({ profile, children }: Props) {
  const [viewAs, setViewAs] = useState<ViewMode>('admin');
  const isAdmin = profile.role === 'admin';

  return (
    <ChatProvider>
      <ViewModeContext.Provider value={{ viewAs, setViewAs }}>
        <a href="#portal-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-blue-700 focus:px-4 focus:py-3 focus:text-white">Ga naar inhoud</a>
        <DashboardSidebar profile={profile} />
        <main id="portal-content" tabIndex={-1} className="min-h-screen min-w-0 bg-slate-50 text-slate-900 lg:pl-64 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-blue-600 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-blue-600">
          <DashboardBreadcrumbs />
          {isAdmin && viewAs === 'user' && (
            <UserPreviewBanner onExit={() => setViewAs('admin')} />
          )}
          {children}
        </main>
        <ChatWidget profile={profile} />
      </ViewModeContext.Provider>
    </ChatProvider>
  );
}
