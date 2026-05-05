'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import IntrICTLogo from '@/components/common/IntrICTLogo';

type Mode = 'login' | 'reset';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Ongeldig e-mailadres of wachtwoord.');
      setLoading(false);
      return;
    }

    // SSO: lees ?next= direct uit window.location (useSearchParams vereist Suspense)
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const ALLOWED_SUBDOMAINS = ['https://tools.intrict.com', 'https://socman.intrict.com'];
    if (next && ALLOWED_SUBDOMAINS.some((origin) => next.startsWith(origin))) {
      window.location.href = next;
      return;
    }

    router.refresh();
    router.push('/dashboard');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
    });

    setResetLoading(false);

    if (error) {
      setResetError('Er is iets misgegaan. Controleer het e-mailadres en probeer opnieuw.');
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Terug naar website */}
      <a
        href="https://intrict.com"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={15} />
        Terug naar intrict.com
      </a>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white shadow-2xl rounded-2xl md:p-10">

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-8 text-center">
                  <IntrICTLogo variant="light" className="h-10 w-auto mx-auto mb-2" />
                  <p className="text-slate-500">Meld aan bij je dashboard</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-4 mb-6 border border-red-200 bg-red-50 rounded-xl"
                  >
                    <span className="text-red-500 shrink-0">⚠️</span>
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@bedrijf.be"
                      className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                        Wachtwoord
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setResetEmail(email); setResetError(''); setResetSent(false); }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Wachtwoord vergeten?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Aanmelden...' : 'Aanmelden'}
                  </motion.button>
                </form>

                <p className="mt-6 text-sm text-center text-slate-500">
                  Geen account?{' '}
                  <a href="https://intrict.com" className="font-semibold text-blue-500 hover:underline">
                    Bezoek onze website
                  </a>
                </p>
              </motion.div>
            )}

            {mode === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setMode('login')}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Terug naar aanmelden
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Wachtwoord resetten</h2>
                  <p className="text-sm text-slate-500">
                    Voer je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.
                  </p>
                </div>

                {resetSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <CheckCircle2 size={40} className="text-emerald-500" />
                    <p className="font-semibold text-slate-800">E-mail verstuurd!</p>
                    <p className="text-sm text-slate-500">
                      Controleer je inbox op <span className="font-medium">{resetEmail}</span> en volg de link om je wachtwoord te resetten.
                    </p>
                    <button
                      onClick={() => setMode('login')}
                      className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                      Terug naar aanmelden
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-5">
                    {resetError && (
                      <div className="flex items-start gap-2 p-4 border border-red-200 bg-red-50 rounded-xl">
                        <span className="text-red-500 shrink-0">⚠️</span>
                        <p className="text-sm text-red-700">{resetError}</p>
                      </div>
                    )}
                    <div>
                      <label htmlFor="reset-email" className="block mb-2 text-sm font-semibold text-slate-700">
                        E-mail
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="jan@bedrijf.be"
                        className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={resetLoading}
                      whileHover={{ scale: resetLoading ? 1 : 1.02 }}
                      whileTap={{ scale: resetLoading ? 1 : 0.98 }}
                      className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Versturen...' : 'Reset-link versturen'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
