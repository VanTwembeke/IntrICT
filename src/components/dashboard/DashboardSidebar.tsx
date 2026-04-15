'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Mail,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  ChevronRight,
  Send,
  ExternalLink,
  Eye,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  Receipt,
  Newspaper,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useMessages } from '@/hooks/useMessages';
import { usePendingRequestsCount } from '@/hooks/usePendingRequestsCount';
import { useViewMode, type ViewMode } from './DashboardShell';
import type { Profile, UserRole } from '@/lib/types';

// ─── Nav definitions ──────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: 'unread' | 'pending';
  exact?: boolean; // if false, active for all sub-routes too
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard',            icon: <LayoutDashboard size={18} />, roles: ['admin', 'user'], exact: true },
  { label: 'Berichten',       href: '/dashboard/messages',   icon: <Mail size={18} />,            roles: ['admin', 'user'], badge: 'unread' },
  { label: 'Pakketten',       href: '/dashboard/pakketten',  icon: <Package size={18} />,         roles: ['admin', 'user'] },
  { label: 'Kalender',        href: '/dashboard/kalender',   icon: <CalendarDays size={18} />,    roles: ['admin', 'user'], exact: false },
  { label: 'Aanvragen',       href: '/dashboard/aanvragen',  icon: <ClipboardList size={18} />,   roles: ['admin'],         badge: 'pending' },
  { label: 'Klanten',         href: '/dashboard/klanten',    icon: <FolderOpen size={18} />,      roles: ['admin'],         exact: false },
  { label: 'Facturen',        href: '/dashboard/facturen',   icon: <Receipt size={18} />,         roles: ['admin'],         exact: false },
  { label: 'Gebruikers',      href: '/dashboard/users',      icon: <Users size={18} />,           roles: ['admin'] },
  { label: 'E-mail verzenden',href: '/dashboard/email',          icon: <Send size={18} />,      roles: ['admin'] },
  { label: 'Nieuwsbrief',    href: '/dashboard/nieuwsbrief',    icon: <Newspaper size={18} />, roles: ['admin'], exact: false },
];

const accountNavItems: NavItem[] = [
  { label: 'Mijn profiel',  href: '/dashboard/profile',  icon: <User size={18} />,     roles: ['admin', 'user'] },
  { label: 'Instellingen',  href: '/dashboard/settings', icon: <Settings size={18} />, roles: ['admin', 'user'] },
];

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
  unread,
  pending,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  unread: number;
  pending: number;
  onClick?: () => void;
}) {
  const badgeCount = item.badge === 'unread' ? unread : item.badge === 'pending' ? pending : 0;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {badgeCount > 0 && (
        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
          isActive ? 'bg-white/25 text-white' : 'bg-blue-500 text-white'
        }`}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      {isActive && <ChevronRight size={14} className="text-white/60" />}
    </Link>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  profile,
  pathname,
  onLinkClick,
}: {
  profile: Profile;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const router = useRouter();
  const { unreadCount } = useMessages();
  const { viewAs, setViewAs } = useViewMode();
  const isAdmin = profile.role === 'admin';
  const pendingCount = usePendingRequestsCount(isAdmin);

  // When in user-preview mode, only show user-role nav items
  const effectiveRole: UserRole = (isAdmin && viewAs === 'user') ? 'user' : profile.role;

  const filteredMain = mainNavItems.filter((i) => i.roles.includes(effectiveRole));
  const filteredAccount = accountNavItems.filter((i) => i.roles.includes(effectiveRole));
  const initials = (profile.full_name ?? profile.email)[0].toUpperCase();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            onClick={onLinkClick}
            className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            IntrICT
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            viewAs === 'user' && isAdmin
              ? 'bg-amber-100 text-amber-700'
              : profile.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
          }`}>
            {viewAs === 'user' && isAdmin ? 'Gebruikersweergave' : profile.role === 'admin' ? 'Admin' : 'Account'}
          </span>
        </div>
        <Link
          href="/"
          onClick={onLinkClick}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
        >
          <ExternalLink size={11} />
          Naar de website
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {profile.full_name ?? 'Gebruiker'}
            </p>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-5">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase text-slate-400">Menu</p>
          <div className="space-y-0.5">
            {filteredMain.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={item.exact === false ? pathname.startsWith(item.href) : pathname === item.href}
                unread={unreadCount}
                pending={pendingCount}
                onClick={onLinkClick}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase text-slate-400">Account</p>
          <div className="space-y-0.5">
            {filteredAccount.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                unread={unreadCount}
                pending={pendingCount}
                onClick={onLinkClick}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Admin: impersonation toggle */}
      {isAdmin && (
        <div className="px-4 pb-3 shrink-0">
          <button
            onClick={() => {
              setViewAs(viewAs === 'admin' ? 'user' : 'admin');
              onLinkClick?.();
            }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              viewAs === 'user'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {viewAs === 'user' ? <ShieldCheck size={18} /> : <Eye size={18} />}
            {viewAs === 'user' ? 'Terug naar admin-view' : 'Bekijk als gebruiker'}
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="px-4 pb-6 pt-2 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={18} />
          Afmelden
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white border-r border-slate-200 z-30">
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Mobile: hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -288, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 left-0 z-50 w-72 h-full bg-white shadow-2xl lg:hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  aria-label="Sluit menu"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                profile={profile}
                pathname={pathname}
                onLinkClick={() => setOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
