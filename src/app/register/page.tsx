'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import IntrICTLogo from '@/components/common/IntrICTLogo';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <IntrICTLogo variant="light" className="h-10 w-auto mx-auto mb-2" />
            <p className="text-slate-500">Maak een account aan</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2 items-start"
            >
              <span className="text-red-500 shrink-0">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-semibold text-slate-700">
                Volledige naam
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jan Janssen"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 transition-all duration-200"
              />
            </div>
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
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 transition-all duration-200"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimaal 6 tekens"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 transition-all duration-200"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 font-semibold text-white bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Account aanmaken...' : 'Registreren'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Al een account?{' '}
            <a href="/login" className="text-blue-500 font-semibold hover:underline">
              Aanmelden
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
