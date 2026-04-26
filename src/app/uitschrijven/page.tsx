'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailX, CheckCircle2, ArrowLeft } from 'lucide-react';

type State = 'idle' | 'loading' | 'done' | 'error';

export default function UitschrijvenPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

  // Pre-fill e-mail vanuit ?email= URL-parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) setEmail(decodeURIComponent(e));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Er is iets misgegaan.');
      }

      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan.');
      setState('error');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
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
            {state === 'done' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-6 text-center"
              >
                <CheckCircle2 size={48} className="text-emerald-500" />
                <h2 className="text-2xl font-bold text-slate-800">Uitgeschreven</h2>
                <p className="text-sm text-slate-500">
                  <span className="font-medium">{email}</span> is uitgeschreven van de IntrICT nieuwsbrief. Je ontvangt geen e-mails meer.
                </p>
                <a
                  href="https://intrict.com"
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Terug naar intrict.com
                </a>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                    <MailX size={22} className="text-slate-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">Uitschrijven</h1>
                  <p className="text-sm text-slate-500">
                    Bevestig je e-mailadres om je uit te schrijven van de IntrICT nieuwsbrief.
                  </p>
                </div>

                {state === 'error' && (
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
                    <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">
                      E-mailadres
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

                  <motion.button
                    type="submit"
                    disabled={state === 'loading'}
                    whileHover={{ scale: state === 'loading' ? 1 : 1.02 }}
                    whileTap={{ scale: state === 'loading' ? 1 : 0.98 }}
                    className="w-full py-3 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-slate-600 to-slate-800 rounded-xl hover:from-slate-700 hover:to-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {state === 'loading' ? 'Bezig...' : 'Uitschrijven bevestigen'}
                  </motion.button>
                </form>

                <p className="mt-6 text-xs text-center text-slate-400">
                  Je gegevens worden niet met derden gedeeld.{' '}
                  <a href="/privacy" className="hover:underline">Privacybeleid</a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
