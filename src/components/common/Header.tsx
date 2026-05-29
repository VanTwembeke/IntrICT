'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Menu, ChevronDown, LogOut, Settings, LayoutDashboard,
  Package, Mail, Building2, Eye, ArrowRight, BookOpen, MessageSquare,
  Zap, Globe, User as UserIcon, ClipboardList, Bell, Wrench,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useMessages } from '@/hooks/useMessages';
import { blogPosts } from '@/data/blog-posts';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Lang } from '@/i18n';
import IntrICTLogo from './IntrICTLogo';

// ─── Fuzzy search ─────────────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return true;
  if (t.includes(q)) return true;
  if (q.length < 3) return false;
  return t.split(/\s+/).some(word => {
    if (word.startsWith(q)) return true;
    if (Math.abs(word.length - q.length) > 2) return false;
    return levenshtein(q, word) <= 1;
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

interface NavItem { href: string; Icon: React.ElementType; label: string; desc: string }
interface NavGroup { label: string; href?: string; items?: NavItem[] }

const STATUS_LABELS_NL: Record<string, string> = {
  pending: 'Nieuw', contacted: 'Gecontacteerd', accepted: 'Geaccepteerd', rejected: 'Afgewezen',
};
const STATUS_LABELS_EN: Record<string, string> = {
  pending: 'New', contacted: 'Contacted', accepted: 'Accepted', rejected: 'Rejected',
};

// Blog search items are language-agnostic (titles stay in original language)
const SEARCH_BLOGS = blogPosts.map((post) => ({
  label: post.title,
  desc:  post.excerpt.length > 70 ? post.excerpt.slice(0, 70) + '…' : post.excerpt,
  href:  `/blog/${post.slug}`,
  Icon:  BookOpen,
  cat:   'Blog',
  tags:  post.tags,
}));

// ─── Command palette ──────────────────────────────────────────────────────────

function CommandPalette({ isLoggedIn, onClose, isMac, lang }: { isLoggedIn: boolean; onClose: () => void; isMac: boolean; lang: Lang }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const s = t.search;
  const SEARCH_PAGES = [
    { label: s.home,      desc: s.homeDesc,         href: '/',            Icon: Globe,     cat: s.pages },
    { label: t.nav.portfolio, desc: s.portfolioDesc, href: '/portfolio',  Icon: Building2, cat: s.pages },
    { label: t.nav.oplossingen, desc: s.oplossingenDesc, href: '/oplossingen', Icon: Zap, cat: s.pages },
    { label: t.nav.overIntrict, desc: s.overDesc,   href: '/over',        Icon: UserIcon,  cat: s.pages },
    { label: t.nav.onzeVisie, desc: s.visieDesc,    href: '/visie',       Icon: Eye,       cat: s.pages },
    { label: t.nav.contact, desc: s.contactDesc,    href: '/contact',     Icon: Mail,      cat: s.pages },
  ];
  const SEARCH_DASHBOARD = [
    { label: 'Dashboard',      desc: s.dashboardDesc, href: '/dashboard',           Icon: LayoutDashboard, cat: s.dashboard, auth: true },
    { label: 'Pakketten',      desc: s.packagesDesc,  href: '/dashboard/pakketten', Icon: Package,         cat: s.dashboard, auth: true },
    { label: t.header.messages, desc: s.messagesDesc, href: '/dashboard/messages',  Icon: MessageSquare,   cat: s.dashboard, auth: true },
    { label: t.header.requests, desc: s.requestsDesc, href: '/dashboard/aanvragen', Icon: ClipboardList,   cat: s.dashboard, auth: true },
  ];
  const SEARCH_ACTIONS = [
    { label: s.quoteAction,  desc: s.quoteActionDesc, href: '/contact',   Icon: ArrowRight, cat: s.actions },
    { label: s.demosAction,  desc: s.demosActionDesc, href: '/portfolio', Icon: Eye,        cat: s.actions },
  ];
  const searchBlogs = SEARCH_BLOGS.map(b => ({ ...b, cat: s.blog }));

  const allItems = [
    ...SEARCH_PAGES,
    ...searchBlogs,
    ...(isLoggedIn ? SEARCH_DASHBOARD : []),
    ...SEARCH_ACTIONS,
  ];

  const filtered = query
    ? allItems.filter(i => {
        if (fuzzyMatch(query, i.label) || fuzzyMatch(query, i.desc)) return true;
        const tags = (i as { tags?: string[] }).tags;
        return tags?.some(t => fuzzyMatch(query, t)) ?? false;
      })
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
      className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-2xl"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={17} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.header.searchPlaceholder}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200 shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[58vh] py-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Search size={24} className="mx-auto mb-2 text-slate-200" />
              <p className="text-sm text-slate-400">{t.header.noResults} &ldquo;{query}&rdquo;</p>
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
                        <p className="text-xs truncate text-slate-400">{item.desc}</p>
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
            {t.header.navigate}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold">↵</kbd>
            {t.header.open}
          </span>
          <span className="ml-auto">{isMac ? '⌘K' : 'Ctrl+K'} {t.header.searchShortcut}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Notifications panel ──────────────────────────────────────────────────────

interface PackageReqMini { id: string; package_name: string; status: string }

function NotificationsPanel({
  conversations, unreadCount, messagesLoading, packageRequests,
  onClose, onDismissRequest, onClearAllRequests, onMarkAsRead, statusLabels,
}: {
  conversations: ReturnType<typeof useMessages>['conversations'];
  unreadCount: number;
  messagesLoading: boolean;
  packageRequests: PackageReqMini[];
  onClose: () => void;
  onDismissRequest: (id: string) => void;
  onClearAllRequests: () => void;
  onMarkAsRead: (conversationId: string) => void;
  statusLabels: Record<string, string>;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');

  const go = (href: string) => { router.push(href); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border shadow-2xl w-80 rounded-2xl border-slate-200"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { id: 'messages' as const, label: t.header.messages, Icon: MessageSquare, count: unreadCount },
          ...(packageRequests.length > 0 ? [{ id: 'requests' as const, label: t.header.requests, Icon: Package, count: packageRequests.length }] : []),
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
              <span className={`min-w-4.5 h-4.5 px-1 flex items-center justify-center text-[10px] font-bold rounded-full ${
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.header.conversations}</span>
            <button onClick={() => go('/dashboard/messages')} className="text-xs font-semibold text-blue-500 hover:text-blue-600">All →</button>
          </div>
          {messagesLoading ? (
            <div className="py-8 text-sm text-center text-slate-400">{t.header.loading}</div>
          ) : conversations.length === 0 ? (
            <div className="py-10 text-center">
              <MessageSquare size={24} className="mx-auto mb-2 text-slate-200" />
              <p className="text-sm text-slate-400">{t.header.noMessages}</p>
            </div>
          ) : (
            <ul className="overflow-y-auto divide-y divide-slate-100 max-h-64">
              {conversations.slice(0, 5).map(conv => (
                <li key={conv.id} onClick={() => go('/dashboard/messages')}
                  className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-slate-50">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${conv.unread_count > 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                      {conv.subject}
                    </p>
                    {conv.last_message?.sender && (
                      <p className="text-xs truncate text-slate-400">
                        {conv.last_message.sender.full_name ?? conv.last_message.sender.email}: {conv.last_message.content}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 mt-0.5">
                      {new Date(conv.updated_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <button
                      title="Markeer als gelezen"
                      onClick={(e) => { e.stopPropagation(); onMarkAsRead(conv.id); }}
                      className="min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center bg-blue-500 hover:bg-slate-300 text-white text-[10px] font-bold rounded-full shrink-0 transition-colors"
                    >
                      {conv.unread_count}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.header.packageRequests}</span>
            <div className="flex items-center gap-2">
              {packageRequests.length > 0 && (
                <button onClick={onClearAllRequests} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                  {t.header.clearAll}
                </button>
              )}
              <button onClick={() => go('/dashboard/aanvragen')} className="text-xs font-semibold text-blue-500 hover:text-blue-600">Alles →</button>
            </div>
          </div>
          {packageRequests.length === 0 ? (
            <div className="py-10 text-center">
              <Package size={24} className="mx-auto mb-2 text-slate-200" />
              <p className="text-sm text-slate-400">{t.header.noRequests}</p>
            </div>
          ) : (
            <ul className="overflow-y-auto divide-y divide-slate-100 max-h-64">
              {packageRequests.map(req => (
                <li key={req.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
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
                    <p className="text-sm font-semibold truncate text-slate-800">{req.package_name}</p>
                    <p className="text-xs text-slate-400">{statusLabels[req.status] ?? req.status}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismissRequest(req.id); }}
                    className="p-1 transition-colors rounded text-slate-300 hover:text-slate-500 shrink-0"
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
    <div className="absolute left-0 z-50 invisible pt-3 transition-all duration-200 translate-y-1 opacity-0 top-full group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
      <div className="w-56 py-2 bg-white border shadow-2xl rounded-2xl border-slate-200">
        {items.map(item => {
          const Icon = item.Icon;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group/item">
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover/item:bg-blue-100 transition-colors shrink-0">
                <Icon size={14} className="transition-colors text-slate-500 group-hover/item:text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate transition-colors text-slate-800 group-hover/item:text-blue-700">{item.label}</p>
                <p className="text-xs truncate text-slate-400">{item.desc}</p>
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
  onLogout, onOpenSearch, pathname, isMac, nav,
}: {
  isOpen: boolean; onClose: () => void; user: User | null;
  avatarLabel: string; profilePicture: string | null; userRole: string;
  unreadCount: number; onLogout: () => void; onOpenSearch: () => void; pathname: string; isMac: boolean;
  nav: NavGroup[];
}) {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
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
            className="fixed top-0 bottom-0 right-0 z-50 flex flex-col w-full max-w-sm bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 shrink-0">
              <Link href="/" onClick={onClose} className="shrink-0">
                <IntrICTLogo variant="light" className="h-8 w-auto" />
              </Link>
              <button onClick={onClose} className="p-2 transition-all rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
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
                {t.header.searchPages}
                <kbd className="ml-auto px-1.5 py-0.5 text-[9px] font-bold bg-white border border-slate-200 rounded">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {nav.map(group => {
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
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl text-slate-700 hover:bg-slate-50"
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

            {/* Language switcher (mobile) */}
            <div className="px-4 py-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
                {(['nl', 'en'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-widest ${
                      lang === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* User section */}
            <div className="px-4 pt-4 pb-8 space-y-2 border-t border-slate-100 shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-slate-50">
                    {profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profilePicture} alt="Profiel" className="object-cover rounded-full w-9 h-9 shrink-0" />
                    ) : (
                      <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                        {avatarLabel}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-semibold truncate text-slate-800">{user.email?.split('@')[0]}</p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {userRole === 'admin' ? t.header.administrator : t.header.user}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => go('/dashboard')}
                    className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <LayoutDashboard size={16} />
                    Dashboard
                    {unreadCount > 0 && (
                      <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs font-bold">{unreadCount}</span>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => go('/dashboard/profile')}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                      <UserIcon size={14} /> {t.header.profile}
                    </button>
                    <button onClick={() => go('/dashboard/settings')}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                      <Settings size={14} /> {t.header.settings}
                    </button>
                  </div>
                  <button onClick={() => { onLogout(); onClose(); }}
                    className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                    <LogOut size={15} /> {t.header.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/contact" onClick={onClose}
                    className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white transition-all rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    {t.header.freeQuoteLong} <ArrowRight size={14} />
                  </Link>
                  <button onClick={() => { router.push('/login'); onClose(); }}
                    className="w-full py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                    {t.header.login}
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
  const { t, lang, setLang } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMac] = useState(() =>
    typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  );
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

  const { conversations, unreadCount, loading: messagesLoading, markAsRead } = useMessages();

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
  const STATUS_LABELS = lang === 'en' ? STATUS_LABELS_EN : STATUS_LABELS_NL;

  const NAV: NavGroup[] = [
    {
      label: t.nav.diensten,
      items: [
        { href: '/#services',   Icon: Building2, label: t.nav.watWeDoen,  desc: t.nav.watWeDoenDesc },
        { href: '/oplossingen', Icon: Zap,        label: t.nav.oplossingen, desc: t.nav.oplossingenDesc },
        { href: '/#workflow',   Icon: ArrowRight, label: t.nav.onsProces,  desc: t.nav.onsProcesDesc },
      ],
    },
    { label: t.nav.portfolio, href: '/portfolio' },
    { label: t.nav.blog,      href: '/blog' },
    {
      label: t.nav.over,
      items: [
        { href: '/over',  Icon: UserIcon, label: t.nav.overIntrict, desc: t.nav.overIntrictDesc },
        { href: '/visie', Icon: Eye,      label: t.nav.onzeVisie,   desc: t.nav.onzeVisieDesc },
      ],
    },
    { label: t.nav.contact, href: '/contact' },
  ];

  const avatarLabel = userName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';
  const navText = isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-200 hover:text-white';
  const totalNotifs = unreadCount + (visibleRequests.length > 0 ? 1 : 0);

  return (
    <>
      {/* Skip navigation — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:font-semibold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Ga naar hoofdinhoud
      </a>

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
            <motion.a href="/" whileHover={{ scale: 1.04 }} className="shrink-0">
              <IntrICTLogo variant={isScrolled ? 'light' : 'dark'} />
            </motion.a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {NAV.map((group) => {
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
            <div className="items-center hidden gap-2 md:flex shrink-0">

              {/* Search button */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  isScrolled ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/10'
                }`}
                aria-label={`${t.header.search} (${isMac ? '⌘K' : 'Ctrl+K'})`}
              >
                <Search size={16} />
                <kbd className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                  isScrolled ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white/10 border-white/20 text-white/60'
                }`}>{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
              </motion.button>

              {/* Language switcher */}
              <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${isScrolled ? 'bg-slate-100' : 'bg-white/10'}`}>
                {(['nl', 'en'] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-widest transition-all ${
                      lang === l
                        ? isScrolled ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white'
                        : isScrolled ? 'text-slate-500 hover:text-slate-700' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

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
                      aria-label={t.header.notifications}
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
                          onMarkAsRead={markAsRead}
                          statusLabels={STATUS_LABELS}
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
                        <img src={profilePicture} alt="Profiel" className="object-cover rounded-full w-7 h-7" />
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
                          className="absolute right-0 z-50 mt-3 overflow-hidden bg-white border shadow-2xl w-60 rounded-2xl border-slate-200"
                        >
                          {/* Profile header */}
                          <div className="px-4 py-3.5 border-b border-slate-100 bg-linear-to-br from-slate-50 to-blue-50/40">
                            <div className="flex items-center gap-3">
                              {profilePicture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profilePicture} alt="Profiel" className="object-cover w-10 h-10 rounded-full shadow" />
                              ) : (
                                <span className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full shadow bg-linear-to-br from-blue-500 to-purple-500">
                                  {avatarLabel}
                                </span>
                              )}
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate text-slate-800">{userName ?? user.email?.split('@')[0]}</p>
                                <p className="text-xs truncate text-slate-400">{user.email}</p>
                                <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {userRole === 'admin' ? t.header.administrator : t.header.user}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="py-1.5">
                            {[
                              { href: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
                              { href: '/dashboard/pakketten', Icon: Package, label: lang === 'en' ? 'Packages' : 'Pakketten' },
                              { href: '/dashboard/messages', Icon: MessageSquare, label: t.header.messages, count: unreadCount },
                              { href: '/dashboard/profile', Icon: UserIcon, label: t.header.profile },
                              { href: '/dashboard/settings', Icon: Settings, label: t.header.settings },
                            ].map(item => (
                              <Link key={item.href} href={item.href}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                <item.Icon size={15} className="text-slate-400 shrink-0" />
                                <span className="flex-1">{item.label}</span>
                                {item.count && item.count > 0 && (
                                  <span className="min-w-4.5 h-4.5 px-1 flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full">
                                    {item.count > 9 ? '9+' : item.count}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>

                          <div className="border-t border-slate-100 py-1.5">
                            <a href="https://tools.intrict.com"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                              <Wrench size={15} className="text-slate-400 shrink-0" />
                              <span className="flex-1">{lang === 'en' ? 'Tools' : 'Tools'}</span>
                            </a>
                          </div>

                          <div className="border-t border-slate-100 py-1.5">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut size={15} className="shrink-0" />
                              {t.header.logout}
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
                    {t.header.login}
                  </motion.button>
                  <motion.a href="/contact"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all duration-300">
                    {t.header.freeQuote}
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
              aria-label={t.header.menuOpen}
            >
              <Menu size={22} />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Command palette */}
      <AnimatePresence>
        {showSearch && (
          <CommandPalette isLoggedIn={!!user} onClose={() => setShowSearch(false)} isMac={isMac} lang={lang} />
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
        isMac={isMac}
        nav={NAV}
      />
    </>
  );
}
