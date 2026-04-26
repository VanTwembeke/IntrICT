'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase zet de sessie via PKCE na de callback — wacht tot die actief is
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
      } else {
        // Luister op PASSWORD_RECOVERY event (fallback voor oudere flow)
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setSessionReady(true);
          }
        });
        return () => listener.subscription.unsubscribe();
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten.');
      return;
    }
    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError('Er is iets misgegaan. Probeer opnieuw of vraag een nieuwe reset-link aan.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/dashboard'), 3000);
  }

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Zwak', 'Matig', 'Redelijk', 'Goed', 'Sterk'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'][strength];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white shadow-2xl rounded-2xl md:p-10">

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <CheckCircle2 size={48} className="text-emerald-500" />
              <h2 className="text-2xl font-bold text-slate-800">Wachtwoord gewijzigd!</h2>
              <p className="text-sm text-slate-500">Je wordt automatisch doorgestuurd naar je dashboard...</p>
            </motion.div>

          ) : !sessionReady ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Beveiliging verifiëren...</p>
              <p className="text-xs text-slate-400 mt-2">
                Als dit blijft hangen,{' '}
                <a href="/login" className="text-blue-500 hover:underline">
                  vraag een nieuwe reset-link aan
                </a>.
              </p>
            </div>

          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                  <ShieldCheck size={22} className="text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Nieuw wachtwoord</h1>
                <p className="text-sm text-slate-500">Kies een sterk wachtwoord voor je account.</p>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-semibold text-slate-700">
                    Nieuw wachtwoord
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className="w-full px-4 py-3 pr-11 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Sterkte-indicator */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block mb-2 text-sm font-semibold text-slate-700">
                    Bevestig wachtwoord
                  </label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Herhaal wachtwoord"
                    className={`w-full px-4 py-3 transition-all duration-200 border-2 rounded-xl focus:outline-none focus:ring-2 text-slate-800 placeholder:text-slate-400 ${
                      confirm.length > 0 && confirm !== password
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {confirm.length > 0 && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">Wachtwoorden komen niet overeen.</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || password !== confirm || password.length < 8}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Opslaan...' : 'Wachtwoord opslaan'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
