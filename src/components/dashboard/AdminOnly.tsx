'use client';

import { useViewMode } from './DashboardShell';

/**
 * Renders children only when the effective role is 'admin'.
 * In "view as user" impersonation mode this returns null,
 * so admins can see exactly what regular users see.
 */
export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { viewAs } = useViewMode();
  if (viewAs === 'user') return null;
  return <>{children}</>;
}
