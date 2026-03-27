'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Mail,
  Users,
  User,
  LogOut,
  ShoppingBag,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

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
    label: 'Inbox',
    href: '/dashboard/inbox',
    icon: <Mail size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Gebruikers',
    href: '/dashboard/users',
    icon: <Users size={18} />,
    roles: ['admin'],
  },
  // Scalable: voeg hier nieuwe items toe
  // { label: 'Bestellingen', href: '/dashboard/orders', icon: <ShoppingBag size={18} />, roles: ['admin'] },
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
    roles: ['admin'],
  },
];

interface SidebarProps {
  role: UserRole;
  email: string;
  fullName: string | null;
}

export default function Sidebar({ role, email, fullName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">IntrICT</h1>
        <p className="text-xs text-slate-400 mt-1 capitalize">{role} dashboard</p>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(fullName ?? email)[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{fullName ?? 'Gebruiker'}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filtered.map((item) => {
          const isActive = pathname === item.href;
          return (
            
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={18} />
          Afmelden
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed top-0 left-0 z-50 w-64 h-full bg-slate-900 flex flex-col"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <NavContent />
          </motion.aside>
        </>
      )}
    </>
  );
}
