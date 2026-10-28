'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ExternalLink,
  Eye,
  ShieldCheck,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  Receipt,
  Newspaper,
  FileSignature,
  Palette,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useChatContext } from '@/contexts/ChatContext';
import { usePendingRequestsCount } from '@/hooks/usePendingRequestsCount';
import { usePendingAppointmentsCount } from '@/hooks/usePendingAppointmentsCount';
import { useViewMode } from './DashboardShell';
import IntrICTLogo from '@/components/common/IntrICTLogo';
import type { Profile, UserRole } from '@/lib/types';

// ─── Nav definitions ──────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: 'unread' | 'pending' | 'pending_appt';
  exact?: boolean; // if false, active for all sub-routes too
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard',            icon: <LayoutDashboard size={18} />, roles: ['admin', 'user', 'klant'], exact: true },
  { label: 'Berichten',       href: '/dashboard/messages',   icon: <Mail size={18} />,            roles: ['admin', 'user', 'klant'], badge: 'unread' },
  { label: 'Pakketten',       href: '/dashboard/pakketten',  icon: <Package size={18} />,         roles: ['admin', 'user', 'klant'] },
  { label: 'Kalender',         href: '/dashboard/kalender',        icon: <CalendarDays size={18} />,    roles: ['admin'],         exact: false, badge: 'pending_appt' },
  { label: 'Aanvragen',        href: '/dashboard/aanvragen',       icon: <ClipboardList size={18} />,   roles: ['admin'],         badge: 'pending' },
  { label: 'Klanten',          href: '/dashboard/klanten',         icon: <FolderOpen size={18} />,      roles: ['admin'],         exact: false },
  { label: 'Facturen',         href: '/dashboard/facturen',        icon: <Receipt size={18} />,         roles: ['admin'],         exact: false },
  { label: 'Contracten',       href: '/dashboard/contracten',      icon: <FileSignature size={18} />,   roles: ['admin'],         exact: false },
  { label: 'Mijn facturen',    href: '/dashboard/mijn-facturen',   icon: <Receipt size={18} />,         roles: ['user', 'klant'],          exact: false },
  { label: 'Mijn contracten',  href: '/dashboard/mijn-contracten', icon: <FileSignature size={18} />,   roles: ['user', 'klant'],          exact: false },
  { label: 'Gebruikers',      href: '/dashboard/users',      icon: <Users size={18} />,           roles: ['admin'] },
  { label: 'Abonnees',       href: '/dashboard/nieuwsbrief',    icon: <Newspaper size={18} />, roles: ['admin'], exact: false },
  { label: 'Brandgids',     href: '/dashboard/branding',       icon: <Palette size={18} />,   roles: ['admin'] },
];

const navGroup = (href: string) => {
  if (['/dashboard/facturen', '/dashboard/contracten', '/dashboard/mijn-facturen', '/dashboard/mijn-contracten'].includes(href)) return 'Financiën';
  if (['/dashboard/users', '/dashboard/nieuwsbrief', '/dashboard/branding'].includes(href)) return 'Beheer';
  return 'Werkruimte';
};

const accountNavItems: NavItem[] = [
  { label: 'Mijn profiel',  href: '/dashboard/profile',  icon: <User size={18} />,     roles: ['admin', 'user', 'klant'] },
  { label: 'Instellingen',  href: '/dashboard/settings', icon: <Settings size={18} />, roles: ['admin', 'user', 'klant'] },
];

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
  unread,
  pending,
  pendingAppt,
  onClick,
  onChatOpen,
}: {
  item: NavItem;
  isActive: boolean;
  unread: number;
  pending: number;
  pendingAppt: number;
  onClick?: () => void;
  onChatOpen?: () => void;
}) {
  const badgeCount =
    item.badge === 'unread' ? unread :
    item.badge === 'pending' ? pending :
    item.badge === 'pending_appt' ? pendingAppt : 0;

  const chatAction = item.badge === 'unread' && onChatOpen && badgeCount > 0;

  return (
    <div className="flex items-center gap-1">
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center gap-3 min-h-11 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group focus-visible:outline-2 focus-visible:outline-blue-600 ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-600 transition-colors'}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {badgeCount > 0 && !chatAction && (
        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
          isActive ? 'bg-white/25 text-white' : 'bg-blue-600 text-white'
        }`}>
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
      {isActive && <ChevronRight size={14} className="text-white/60" />}
    </Link>
    {chatAction && <button type="button" onClick={onChatOpen}
      aria-label={`Open chat: ${badgeCount} ongelezen berichten`}
      className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-blue-600 px-2 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      {badgeCount > 9 ? '9+' : badgeCount}
    </button>}
    </div>
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
  const { unreadCount, openChat } = useChatContext();
  const { viewAs, setViewAs } = useViewMode();
  const isAdmin = profile.role === 'admin';
  const pendingCount = usePendingRequestsCount(isAdmin);
  const pendingApptCount = usePendingAppointmentsCount(isAdmin);

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
      <div className="px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" onClick={onLinkClick} aria-label="IntrICT overzicht" className="flex min-h-11 items-center">
            <IntrICTLogo variant="light" className="h-6 w-auto" />
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
          className="inline-flex min-h-11 items-center gap-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors"
        >
          <ExternalLink size={11} />
          Naar de website
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg bg-slate-50">
          <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full bg-blue-600 shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {profile.full_name ?? 'Gebruiker'}
            </p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Portaalmenu" className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {['Werkruimte', 'Financiën', 'Beheer'].map(group => {
          const items = filteredMain.filter(item => navGroup(item.href) === group);
          return items.length > 0 && <div key={group}>
            <p className="px-3 mb-1 text-[11px] font-semibold tracking-wider uppercase text-slate-500">{group}</p>
            <div className="space-y-0.5">
              {items.map(item => <NavLink key={item.href} item={item}
                isActive={pathname === item.href || (item.exact !== true && pathname.startsWith(`${item.href}/`))}
                unread={unreadCount} pending={pendingCount} pendingAppt={pendingApptCount}
                onClick={onLinkClick} onChatOpen={() => { onLinkClick?.(); openChat(); }} />)}
            </div>
          </div>;
        })}

        <div>
          <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase text-slate-500">Account</p>
          <div className="space-y-0.5">
            {filteredAccount.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                unread={unreadCount}
                pending={pendingCount}
                pendingAppt={pendingApptCount}
                onClick={onLinkClick}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Admin: impersonation toggle */}
      {isAdmin && (
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={() => {
              setViewAs(viewAs === 'admin' ? 'user' : 'admin');
              onLinkClick?.();
            }}
            className={`flex items-center gap-3 w-full min-h-11 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
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
      <div className="px-3 pb-3 pt-2 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full min-h-11 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white border-r border-slate-200 z-30">
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Mobile: hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          ref={triggerRef}
          aria-expanded={open}
          aria-controls="mobile-portal-menu"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Native modal supplies focus containment and background inertness. */}
      <dialog
        ref={dialogRef}
        id="mobile-portal-menu"
        aria-label="Portaalnavigatie"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const dialog = event.currentTarget;
          const controls = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter((control) => control.isConnected && control.getClientRects().length > 0 && !control.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(control).visibility !== 'hidden');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first || !last) {
            event.preventDefault();
            dialog.focus();
            return;
          }
          const active = document.activeElement;
          if (active === dialog || !dialog.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
          }
        }}
        onClose={(event) => { if (!event.currentTarget.open) setOpen(false); }}
        onCancel={(event) => { event.preventDefault(); setOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 p-0 bg-white shadow-2xl backdrop:bg-black/40"
      >
        {open && <>
          <button autoFocus onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Sluit menu"><X size={18} /></button>
          <SidebarContent profile={profile} pathname={pathname} onLinkClick={() => setOpen(false)} />
        </>}
      </dialog>
    </>
  );
}
