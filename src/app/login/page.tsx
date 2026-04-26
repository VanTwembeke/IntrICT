'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (next && next.startsWith('https://tools.intrict.com')) {
      window.location.href = next;
      return;
    }

    router.refresh();
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white shadow-2xl rounded-2xl md:p-10">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-800">IntrICT</h1>
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
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-slate-700">
                Wachtwoord
              </label>
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
            <a href="/register" className="font-semibold text-blue-500 hover:underline">
              Registreer hier
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}