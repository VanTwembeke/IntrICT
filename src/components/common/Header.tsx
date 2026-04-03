'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useMessages } from '@/hooks/useMessages';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Scroll listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Click-outside to close dropdowns ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target as Node)) {
        setShowMessages(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
    setShowMessages(false);
    router.push('/');
    router.refresh();
  };

  const { conversations, unreadCount, loading: messagesLoading } = useMessages();

  // ── Avatar initials ────────────────────────────────────────────────────────
  const avatarLabel = user?.email ? user.email[0].toUpperCase() : '?';

  // ── Shared text colour class ───────────────────────────────────────────────
  const navText = isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-200 hover:text-white';
  const iconStroke = isScrolled ? '#475569' : '#e2e8f0';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg'
          : 'bg-black/20 backdrop-blur-sm'
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <motion.a href="/" whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
            <span className={`font-semibold text-lg transition-colors duration-300 ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
              IntrICT
            </span>
          </motion.a>

          {/* ── Desktop Nav ── */}
          <nav className="items-center hidden space-x-8 md:flex">
            <DropdownNav label="Home" scrolled={isScrolled}>
              <DropdownLink href="/#services" icon="building">Diensten</DropdownLink>
              <DropdownLink href="/#workflow" icon="check">Proces</DropdownLink>
              <DropdownLink href="/#contact" icon="mail">Contact</DropdownLink>
            </DropdownNav>

            {(['Portfolio', 'Blog', 'Oplossingen'] as const).map((item) => (
              <motion.a
                key={item}
                href={`/${item.toLowerCase()}`}
                whileHover={{ scale: 1.05 }}
                className={`transition-colors duration-200 ${navText}`}
              >
                {item}
              </motion.a>
            ))}

            <DropdownNav label="Info" scrolled={isScrolled} accentColor="green">
              <DropdownLink href="/visie" icon="eye" accentColor="green">Visie</DropdownLink>
              <DropdownLink href="/over" icon="user" accentColor="green">Over</DropdownLink>
              <DropdownLink href="/contact" icon="mail" accentColor="green">Contact</DropdownLink>
            </DropdownNav>
          </nav>

          {/* ── Right Controls ── */}
          {!authLoading && (
            <div className="items-center hidden gap-2 md:flex">

              {user && (
                <>
                  {/* ─ Messages button ─ */}
                  <div ref={messagesRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowMessages(!showMessages); setShowUserMenu(false); }}
                      className={`relative p-2 rounded-full transition-all duration-200 ${
                        isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                      }`}
                      aria-label="Berichten"
                    >
                      {/* Mail icon */}
                      <svg width="20" height="20" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-blue-500 rounded-full shadow"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </motion.button>

                    {/* Messages dropdown */}
                    <AnimatePresence>
                      {showMessages && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 z-50 mt-3 overflow-hidden border shadow-2xl w-80 bg-white/98 backdrop-blur-md rounded-2xl border-slate-200"
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <span className="font-semibold text-slate-800">Berichten</span>
                            <button
                              onClick={() => router.push('/dashboard/messages')}
                              className="text-xs font-medium text-blue-500 hover:underline"
                            >
                              Alle berichten
                            </button>
                          </div>
                          {messagesLoading ? (
                            <div className="px-4 py-6 text-sm text-center text-slate-400">Laden...</div>
                          ) : conversations.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm font-medium text-slate-500">Geen berichten</p>
                              <p className="mt-1 text-xs text-slate-400">Start een gesprek om te beginnen</p>
                            </div>
                          ) : (
                            <ul className="overflow-y-auto divide-y divide-slate-100 max-h-72">
                              {conversations.slice(0, 5).map((conversation) => (
                                <li
                                  key={conversation.id}
                                  className="px-4 py-3 cursor-pointer hover:bg-slate-50"
                                  onClick={() => {
                                    router.push('/dashboard/messages');
                                    setShowMessages(false);
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                        {conversation.subject}
                                      </p>
                                      {conversation.last_message && (
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                          {conversation.last_message.sender.full_name || conversation.last_message.sender.email}: {conversation.last_message.content}
                                        </p>
                                      )}
                                      <p className="mt-0.5 text-xs text-slate-400">
                                        {new Date(conversation.updated_at).toLocaleDateString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}
                                      </p>
                                    </div>
                                    {conversation.unread_count > 0 && (
                                      <span className="inline-flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                                        {conversation.unread_count}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* ─ User Menu / Login button ─ */}
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowMessages(false); }}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full font-medium text-sm transition-all duration-300 ${
                      isScrolled
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                    }`}
                  >
                    <span className="flex items-center justify-center text-xs font-bold text-white rounded-full shadow w-7 h-7 bg-linear-to-br from-blue-500 to-purple-500">
                      {avatarLabel}
                    </span>
                    <span className="truncate max-w-30">{user.email?.split('@')[0]}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-50 w-56 mt-3 overflow-hidden border shadow-2xl bg-white/98 backdrop-blur-md rounded-2xl border-slate-200"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-linear-to-br from-slate-50 to-blue-50/30">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center font-bold text-white rounded-full shadow w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500">
                              {avatarLabel}
                            </span>
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold truncate text-slate-800">{user.email?.split('@')[0]}</p>
                              <p className="text-xs truncate text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <MenuLink href="/dashboard" icon="grid">Dashboard</MenuLink>
                          <MenuLink href="/dashboard/profile" icon="user">Profiel</MenuLink>
                          <MenuLink href="/dashboard/settings" icon="settings">Instellingen</MenuLink>
                        </div>

                        <div className="py-2 border-t border-slate-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Uitloggen
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => router.push('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    isScrolled
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  Log In
                </motion.button>
              )}
            </div>
          )}

          {/* ── Mobile Menu Toggle ── */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg md:hidden glass-card"
          >
            <svg
              className={`w-6 h-6 transition-colors duration-300 ${isScrolled ? 'text-slate-600' : 'text-white'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200 shadow-lg md:hidden bg-white/95 backdrop-blur-md"
          >
            <div className="px-4 py-6 space-y-4">
              {user && (
                <div className="flex items-center gap-3 p-3 border rounded-xl bg-linear-to-r from-slate-50 to-blue-50 border-slate-100">
                  <span className="flex items-center justify-center font-bold text-white rounded-full shadow w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500">
                    {avatarLabel}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate text-slate-800">{user.email?.split('@')[0]}</p>
                    <p className="text-xs truncate text-slate-400">{user.email}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">Home</h3>
                <div className="ml-2 space-y-1">
                  {[['/#services', 'Diensten'], ['/#workflow', 'Proces'], ['/#contact', 'Contact']].map(([href, label]) => (
                    <a key={href} href={href} className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-50">
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                {[['Portfolio', '/portfolio'], ['Blog', '/blog'], ['Oplossingen', '/oplossingen']].map(([label, href]) => (
                  <a key={href} href={href} className="block px-3 py-2 font-semibold transition-colors rounded-lg text-slate-800 hover:bg-slate-50">
                    {label}
                  </a>
                ))}
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">Info</h3>
                <div className="ml-2 space-y-1">
                  {[['/visie', 'Visie'], ['/over', 'Over'], ['/contact', 'Contact']].map(([href, label]) => (
                    <a key={href} href={href} className="flex items-center gap-2 px-3 py-2 transition-colors rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-50">
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-100">
                {user ? (
                  <>
                    <button
                      onClick={() => router.push('/dashboard/messages')}
                      className="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-blue-700 transition-all border border-blue-200 rounded-xl bg-blue-50 hover:bg-blue-100"
                    >
                      Berichten
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full px-6 py-3 font-semibold text-white transition-all shadow-md rounded-xl bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 font-semibold text-red-600 transition-all border border-red-200 rounded-xl hover:bg-red-50"
                    >
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full px-6 py-3 font-semibold text-white transition-all rounded-xl bg-slate-800 hover:bg-slate-700"
                  >
                    Log In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropdownNav({
  label,
  scrolled,
  children,
}: {
  label: string;
  scrolled: boolean;
  accentColor?: 'blue' | 'green';
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ${
          scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-200 hover:text-white'
        }`}
      >
        {label}
        <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <div className="absolute left-0 z-50 invisible mt-3 transition-all duration-200 transform translate-y-2 border shadow-2xl opacity-0 w-52 top-full bg-white/96 backdrop-blur-md rounded-2xl border-slate-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}

const ICONS: Record<string, string> = {
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  mail: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function DropdownLink({
  href,
  icon,
  accentColor = 'blue',
  children,
}: {
  href: string;
  icon: keyof typeof ICONS;
  accentColor?: 'blue' | 'green';
  children: React.ReactNode;
}) {
  const accent = accentColor === 'green'
    ? 'group-hover:text-green-500 hover:from-slate-50 hover:to-green-50'
    : 'group-hover:text-blue-500 hover:from-slate-50 hover:to-blue-50';

  return (
    <motion.a
      href={href}
      whileHover={{ x: 3 }}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-slate-900 transition-all duration-150 bg-linear-to-r ${accent} group`}
    >
      <svg className={`w-4 h-4 shrink-0 text-slate-400 transition-colors duration-150 ${accent.split(' ')[0]}`}
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
      </svg>
      {children}
    </motion.a>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: keyof typeof ICONS; children: React.ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150">
      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
      </svg>
      {children}
    </a>
  );
}