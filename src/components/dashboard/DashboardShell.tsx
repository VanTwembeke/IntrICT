'use client';

import { createContext, useContext, useState } from 'react';
import { Eye } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
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
    <div className="flex items-center justify-center gap-4 px-4 py-2.5 bg-amber-400 text-amber-950 text-sm font-semibold">
      <Eye size={15} />
      <span>Je bekijkt het dashboard als een gewone gebruiker</span>
      <button
        onClick={onExit}
        className="px-3 py-1 rounded-lg bg-amber-950/15 hover:bg-amber-950/25 transition-colors text-xs font-bold"
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
    <ViewModeContext.Provider value={{ viewAs, setViewAs }}>
      <DashboardSidebar profile={profile} />
      <main className="lg:pl-64">
        {isAdmin && viewAs === 'user' && (
          <UserPreviewBanner onExit={() => setViewAs('admin')} />
        )}
        {children}
      </main>
    </ViewModeContext.Provider>
  );
}
