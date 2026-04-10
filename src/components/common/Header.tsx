'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Menu, ChevronDown, LogOut, Settings, LayoutDashboard,
  Package, Mail, Building2, Eye, ArrowRight, BookOpen, MessageSquare,
  Zap, Globe, User as UserIcon, ClipboardList, Bell,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useMessages } from '@/hooks/useMessages';
import { blogPosts } from '@/data/blog-posts';

// ─── Constants ────────────────────────────────────────────────────────────────

interface NavItem { href: string; Icon: React.ElementType; label: string; desc: string }
interface NavGroup { label: string; href?: string; items?: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: 'Diensten',
    items: [
      { href: '/#services',   Icon: Building2, label: 'Wat we doen',  desc: 'Websites, apps & webshops' },
      { href: '/oplossingen', Icon: Zap,        label: 'Oplossingen',  desc: 'Technische oplossingen op maat' },
      { href: '/#workflow',   Icon: ArrowRight, label: 'Ons proces',   desc: 'Hoe werken we samen?' },
    ],
  },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog',      href: '/blog' },
  {
    label: 'Over',
    items: [
      { href: '/over',  Icon: UserIcon, label: 'Over IntrICT', desc: 'Het verhaal achter IntrICT' },
      { href: '/visie', Icon: Eye,      label: 'Onze visie',   desc: 'Missie & kernwaarden' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

const SEARCH_PAGES = [
  { label: 'Home',        desc: 'Homepagina & diensten',        href: '/',            Icon: Globe,     cat: "Pagina's" },
  { label: 'Portfolio',   desc: "Projecten & live demo's",      href: '/portfolio',   Icon: Building2, cat: "Pagina's" },
  { label: 'Oplossingen', desc: 'Oplossingen op maat',          href: '/oplossingen', Icon: Zap,       cat: "Pagina's" },
  { label: 'Over ons',    desc: 'Wie is IntrICT?',              href: '/over',        Icon: UserIcon,  cat: "Pagina's" },
  { label: 'Visie',       desc: 'Missie & waarden',             href: '/visie',       Icon: Eye,       cat: "Pagina's" },
  { label: 'Contact',     desc: 'Neem contact op',              href: '/contact',     Icon: Mail,      cat: "Pagina's" },
];
const SEARCH_BLOGS = blogPosts.map((post) => ({
  label: post.title,
  desc:  post.excerpt.length > 70 ? post.excerpt.slice(0, 70) + '…' : post.excerpt,
  href:  `/blog/${post.slug}`,
  Icon:  BookOpen,
  cat:   'Blog',
}));
const SEARCH_DASHBOARD = [
  { label: 'Dashboard',  desc: 'Jouw persoonlijk dashboard', href: '/dashboard',           Icon: LayoutDashboard, cat: 'Dashboard', auth: true },
  { label: 'Pakketten',  desc: 'Diensten & prijzen',         href: '/dashboard/pakketten', Icon: Package,         cat: 'Dashboard', auth: true },
  { label: 'Berichten',  desc: 'Jouw gesprekken',            href: '/dashboard/messages',  Icon: MessageSquare,   cat: 'Dashboard', auth: true },
  { label: 'Aanvragen',  desc: 'Pakketaanvragen',            href: '/dashboard/aanvragen', Icon: ClipboardList,   cat: 'Dashboard', auth: true },
];
const SEARCH_ACTIONS = [
  { label: 'Gratis offerte aanvragen', desc: 'Vraag een offerte aan voor jouw project', href: '/contact',   Icon: ArrowRight, cat: 'Acties' },
  { label: "Demo's bekijken",          desc: "Live project demo's van IntrICT",          href: '/portfolio', Icon: Eye,        cat: 'Acties' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Nieuw', contacted: 'Gecontacteerd', accepted: 'Geaccepteerd', rejected: 'Afgewezen',
};

// ─── Command palette ──────────────────────────────────────────────────────────

function CommandPalette({ isLoggedIn, onClose }: { isLoggedIn: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const allItems = [
    ...SEARCH_PAGES,
    ...SEARCH_BLOGS,
    ...(isLoggedIn ? SEARCH_DASHBOARD : []),
    ...SEARCH_ACTIONS,
  ];

  const filtered = query
    ? allItems.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.desc.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // group by category
  const groups = filtered.reduce<Record<string, typeof allItems>>((acc, item) => {
    (acc[item.cat] ??= []).push(item);
    return acc;
  }, {});

  useEffect(() => { setCursor(0); }, [query]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && filtered[cursor]) navigate(filtered[cursor].href);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, cursor, navigate, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={17} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Zoek pagina's, dashboard, acties..."
            className="flex-1 text-slate-800 bg-transparent outline-none placeholder:text-slate-400 text-sm"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200 shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[58vh] py-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Geen resultaten voor &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            Object.entries(groups).map(([cat, items]) => (
              <div key={cat} className="mb-2">
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{cat}</p>
                {items.map(item => {
                  const idx = filtered.indexOf(item);
                  const active = cursor === idx;
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.href + item.label}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setCursor(idx)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${active ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Icon size={14} className={active ? 'text-blue-600' : 'text-slate-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-blue-700' : 'text-slate-800'}`}>{item.label}</p>
                        <p className="text-xs text-slate-400 truncate">{item.desc}</p>
                      </div>
                      {active && <ArrowRight size={13} className="text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">↑</kbd>
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">↓</kbd>
            Navigeren
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">↵</kbd>
            Openen
          </span>
          <span className="ml-auto">⌘K om te zoeken</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Notifications panel ──────────────────────────────────────────────────────

interface PackageReqMini { id: string; package_name: string; status: string }

function NotificationsPanel({
  conversations, unreadCount, messagesLoading, packageRequests,
  onClose, onDismissRequest, onClearAllRequests,
}: {
  conversations: ReturnType<typeof useMessages>['conversations'];
  unreadCount: number;
  messagesLoading: boolean;
  packageRequests: PackageReqMini[];
  onClose: () => void;
  onDismissRequest: (id: string) => void;
  onClearAllRequests: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');

  const go = (href: string) => { router.push(href); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 z-50 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { id: 'messages' as const, label: 'Berichten', Icon: MessageSquare, count: unreadCount },
          ...(packageRequests.length > 0 ? [{ id: 'requests' as const, label: 'Aanvragen', Icon: Package, count: packageRequests.length }] : []),
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === t.id ? 'text-blue-600 border-blue-500' : 'text-slate-500 hover:text-slate-700 border-transparent'
            }`}
          >
            <t.Icon size={14} />
            {t.label}
            {t.count > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full ${
                tab === t.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {t.count > 9 ? '9+' : t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'messages' ? (
        <>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gesprekken</span>
            <button onClick={() => go('/dashboard/messages')} className="text-xs font-semibold text-blue-500 hover:text-blue-600">Alles →</button>
          </div>
          {messagesLoading ? (
            <div className="py-8 text-sm text-center text-slate-400">Laden...</div>
          ) : conversations.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Geen berichten</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {conversations.slice(0, 5).map(conv => (
                <li key={conv.id} onClick={() => go('/dashboard/messages')}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${conv.unread_count > 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {conv.subject}
                    </p>
                    {conv.last_message?.sender && (
                      <p className="text-xs text-slate-400 truncate">
                        {conv.last_message.sender.full_name ?? conv.last_message.sender.email}: {conv.last_message.content}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 mt-0.5">
                      {new Date(conv.updated_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pakketaanvragen</span>
            <div className="flex items-center gap-2">
              {packageRequests.length > 0 && (
                <button onClick={onClearAllRequests} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                  Wis alles
                </button>
              )}
              <button onClick={() => go('/dashboard/aanvragen')} className="text-xs font-semibold text-blue-500 hover:text-blue-600">Alles →</button>
            </div>
          </div>
          {packageRequests.length === 0 ? (
            <div className="py-10 text-center">
              <Package size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Geen aanvragen</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {packageRequests.map(req => (
                <li key={req.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                      req.status === 'accepted' ? 'bg-green-50' : req.status === 'rejected' ? 'bg-slate-100' : 'bg-amber-50'
                    }`}
                    onClick={() => go('/dashboard/aanvragen')}
                  >
                    <Package size={13} className={
                      req.status === 'accepted' ? 'text-green-500' : req.status === 'rejected' ? 'text-slate-400' : 'text-amber-500'
                    } />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => go('/dashboard/aanvragen')}>
                    <p className="text-sm font-semibold text-slate-800 truncate">{req.package_name}</p>
                    <p className="text-xs text-slate-400">{STATUS_LABELS[req.status] ?? req.status}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismissRequest(req.id); }}
                    className="p-1 text-slate-300 hover:text-slate-500 rounded transition-colors shrink-0"
                    aria-label="Verwijder melding"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </motion.div>
  );
}

// ─── Mega dropdown ────────────────────────────────────────────────────────────

function MegaDropdown({ items }: { items: NavItem[] }) {
  return (
    <div className="absolute left-0 top-full z-50 pt-3 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 w-56">
        {items.map(item => {
          const Icon = item.Icon;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group/item">
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover/item:bg-blue-100 transition-colors shrink-0">
                <Icon size={14} className="text-slate-500 group-hover/item:text-blue-600 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover/item:text-blue-700 transition-colors truncate">{item.label}</p>
                <p className="text-xs text-slate-400 truncate">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

function MobileDrawer({
  isOpen, onClose, user, avatarLabel, profilePicture, userRole, unreadCount,
  onLogout, onOpenSearch, pathname,
}: {
  isOpen: boolean; onClose: () => void; user: User | null;
  avatarLabel: string; profilePicture: string | null; userRole: string;
  unreadCount: number; onLogout: () => void; onOpenSearch: () => void; pathname: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const go = (href: string) => { router.push(href); onClose(); };
  const isActive = (href: string) => pathname === href;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 shrink-0">
              <Link href="/" onClick={onClose} className="text-xl font-bold text-slate-900">IntrICT</Link>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 py-3 border-b border-slate-100 shrink-0">
              <button
                onClick={() => { onClose(); setTimeout(onOpenSearch, 50); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 hover:bg-slate-100 transition-all text-left"
              >
                <Search size={15} />
                Zoek pagina&apos;s, acties...
                <kbd className="ml-auto px-1.5 py-0.5 text-[9px] font-bold bg-white border border-slate-200 rounded">⌘K</kbd>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {NAV.map(group => {
                if (group.href) {
                  return (
                    <Link key={group.href} href={group.href} onClick={onClose}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive(group.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}>
                      {group.label}
                    </Link>
                  );
                }
                const isExp = expanded === group.label;
                return (
                  <div key={group.label}>
                    <button
                      onClick={() => setExpanded(isExp ? null : group.label)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      {group.label}
                      <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExp && group.items && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 mt-0.5 mb-1.5 space-y-0.5">
                            {group.items.map(item => {
                              const Icon = item.Icon;
                              return (
                                <Link key={item.href} href={item.href} onClick={onClose}
                                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                  <Icon size={14} className="text-slate-400 shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* User section */}
            <div className="px-4 pb-8 pt-4 border-t border-slate-100 shrink-0 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3">
                    {profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profilePicture} alt="Profiel" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {avatarLabel}
                      </div>
                    )}
                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email?.split('@')[0]}</p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {userRole === 'admin' ? 'Administrator' : 'Gebruiker'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('/dashboard')}
                    className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all">
                    <LayoutDashboard size={16} />
                    Dashboard
                    {unreadCount > 0 && (
                      <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs font-bold">{unreadCount}</span>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => go('/dashboard/profile')}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                      <UserIcon size={14} /> Profiel
                    </button>
                    <button onClick={() => go('/dashboard/settings')}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Instellingen
                    </button>
                  </div>
                  <button onClick={() => { onLogout(); onClose(); }}
                    className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                    <LogOut size={15} /> Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link href="/contact" onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all">
                    Gratis offerte aanvragen <ArrowRight size={14} />
                  </Link>
                  <button onClick={() => { router.push('/login'); onClose(); }}
                    className="w-full py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                    Log in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('user');
  const [userName, setUserName] = useState<string | null>(null);
  const [packageRequests, setPackageRequests]   = useState<PackageReqMini[]>([]);
  const [dismissedReqIds, setDismissedReqIds]   = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try { return new Set(JSON.parse(localStorage.getItem('dismissed_req_notifs') ?? '[]')); }
    catch { return new Set(); }
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { conversations, unreadCount, loading: messagesLoading } = useMessages();

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('profile_picture_url, role, full_name')
        .eq('id', userId)
        .single();
      if (data) {
        setProfilePicture(data.profile_picture_url ?? null);
        setUserRole(data.role ?? 'user');
        setUserName(data.full_name ?? null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else { setProfilePicture(null); setUserRole('user'); setUserName(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Package requests ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetch('/api/package-requests')
      .then(r => r.json())
      .then((data: PackageReqMini[]) => setPackageRequests(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, [user]);

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Click outside ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push('/');
    router.refresh();
  };

  const handleDismissRequest = (id: string) => {
    setDismissedReqIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('dismissed_req_notifs', JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  };

  const handleClearAllRequests = () => {
    const ids = new Set(packageRequests.map((r) => r.id));
    setDismissedReqIds((prev) => {
      const next = new Set([...prev, ...ids]);
      try { localStorage.setItem('dismissed_req_notifs', JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  };

  const visibleRequests = packageRequests.filter((r) => !dismissedReqIds.has(r.id));

  const avatarLabel = userName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';
  const navText = isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-200 hover:text-white';
  const totalNotifs = unreadCount + (visibleRequests.length > 0 ? 1 : 0);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/92 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-black/20 backdrop-blur-sm'
        }`}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <motion.a href="/" whileHover={{ scale: 1.04 }}
              className={`font-bold text-xl shrink-0 transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              IntrICT
            </motion.a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {NAV.map(group => {
                const active = group.href ? pathname === group.href : group.items?.some(i => pathname === i.href);
                if (group.href) {
                  return (
                    <Link key={group.href} href={group.href}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/15 text-white'
                          : navText
                      }`}>
                      {group.label}
                    </Link>
                  );
                }
                return (
                  <div key={group.label} className="relative group">
                    <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      active
                        ? isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/15 text-white'
                        : navText
                    } group-hover:${isScrolled ? 'bg-slate-100' : 'bg-white/10'}`}>
                      {group.label}
                      <ChevronDown size={13} className="transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    <MegaDropdown items={group.items!} />
                  </div>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="hidden md:flex items-center gap-2 shrink-0">

              {/* Search button */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isScrolled ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
                }`}
                aria-label="Zoeken (⌘K)"
              >
                <Search size={16} />
                <kbd className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                  isScrolled ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white/10 border-white/20 text-white/60'
                }`}>⌘K</kbd>
              </motion.button>

              {!authLoading && user && (
                <>
                  {/* Notifications bell */}
                  <div ref={notifRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                      className={`relative p-2 rounded-xl transition-all duration-200 ${
                        isScrolled ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
                      }`}
                      aria-label="Meldingen"
                    >
                      <Bell size={18} />
                      {totalNotifs > 0 && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full shadow">
                        </motion.span>
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {showNotifications && (
                        <NotificationsPanel
                          conversations={conversations}
                          unreadCount={unreadCount}
                          messagesLoading={messagesLoading}
                          packageRequests={visibleRequests}
                          onClose={() => setShowNotifications(false)}
                          onDismissRequest={handleDismissRequest}
                          onClearAllRequests={handleClearAllRequests}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* User menu */}
                  <div ref={userMenuRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                      className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        isScrolled
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                      }`}
                    >
                      {profilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profilePicture} alt="Profiel" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[11px] font-bold text-white shadow">
                          {avatarLabel}
                        </span>
                      )}
                      <span className="truncate max-w-24">{userName ?? user.email?.split('@')[0]}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 z-50 w-60 mt-3 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                        >
                          {/* Profile header */}
                          <div className="px-4 py-3.5 border-b border-slate-100 bg-linear-to-br from-slate-50 to-blue-50/40">
                            <div className="flex items-center gap-3">
                              {profilePicture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profilePicture} alt="Profiel" className="w-10 h-10 rounded-full object-cover shadow" />
                              ) : (
                                <span className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow">
                                  {avatarLabel}
                                </span>
                              )}
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{userName ?? user.email?.split('@')[0]}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {userRole === 'admin' ? 'Administrator' : 'Gebruiker'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="py-1.5">
                            {[
                              { href: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
                              { href: '/dashboard/pakketten', Icon: Package, label: 'Pakketten' },
                              { href: '/dashboard/messages', Icon: MessageSquare, label: 'Berichten', count: unreadCount },
                              { href: '/dashboard/profile', Icon: UserIcon, label: 'Profiel' },
                              { href: '/dashboard/settings', Icon: Settings, label: 'Instellingen' },
                            ].map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                <item.Icon size={15} className="text-slate-400 shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {item.count && item.count > 0 && (
                                  <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full">
                                    {item.count > 9 ? '9+' : item.count}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>

                          <div className="border-t border-slate-100 py-1.5">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut size={15} className="shrink-0" />
                              Uitloggen
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Guest: CTA + Login */}
              {!authLoading && !user && (
                <div className="flex items-center gap-2">
                  <motion.button onClick={() => router.push('/login')}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}>
                    Log in
                  </motion.button>
                  <motion.a href="/contact"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all duration-300">
                    Gratis offerte
                    <ArrowRight size={13} />
                  </motion.a>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileOpen(true)}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Menu openen"
            >
              <Menu size={22} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Command palette */}
      <AnimatePresence>
        {showSearch && (
          <CommandPalette isLoggedIn={!!user} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        user={user}
        avatarLabel={avatarLabel}
        profilePicture={profilePicture}
        userRole={userRole}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        onOpenSearch={() => setShowSearch(true)}
        pathname={pathname}
      />
    </>
  );
}
