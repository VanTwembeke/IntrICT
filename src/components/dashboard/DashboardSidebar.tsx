'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['admin', 'user'],
  },
  {
    label: 'Berichten',
    href: '/dashboard/messages',
    icon: <Mail size={18} />,
    roles: ['admin', 'user'],
  },
  {
    label: 'Gebruikers',
    href: '/dashboard/users',
    icon: <Users size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Mijn profiel',
    href: '/dashboard/profile',
    icon: <User size={18} />,
    roles: ['admin', 'user'],
  },
  {
    label: 'Instellingen',
    href: '/dashboard/settings',
    icon: <Settings size={18} />,
    roles: ['admin', 'user'],
  },
];

interface Props {
  profile: Profile;
}

export default function DashboardSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const filtered = navItems.filter((item) => item.roles.includes(profile.role));
  const initials = (profile.full_name ?? profile.email)[0].toUpperCase();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Toggle button — fixed, positioned below the header (header is ~64px) */}
      <div className="fixed z-30 top-20 right-4 sm:right-6">
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg bg-linear-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          <Menu size={18} />
          <span className="hidden sm:inline">Menu</span>
        </motion.button>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 left-0 z-50 flex flex-col h-full shadow-2xl w-72 bg-slate-900"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="text-lg font-bold text-white transition-colors hover:text-blue-400"
                  >
                    IntrICT
                  </Link>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    {profile.role === 'admin' ? 'Admin' : 'Account'}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User card */}
              <div className="px-4 py-3 mx-4 mt-4 border rounded-xl bg-slate-700/40 border-slate-600/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">
                      {profile.full_name ?? 'Gebruiker'}
                    </p>
                    <p className="text-xs truncate text-slate-400">{profile.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 mb-3 text-xs font-semibold tracking-widest uppercase text-slate-500">
                  Navigatie
                </p>
                {filtered.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      <span
                        className={
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-white transition-colors'
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="text-white/60" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="px-4 pt-4 pb-6 border-t border-slate-700/50">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
                >
                  <LogOut size={18} />
                  Afmelden
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}