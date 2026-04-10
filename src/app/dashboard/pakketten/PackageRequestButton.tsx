'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Send, MessageSquare } from 'lucide-react';

interface Props {
  packageName: string;
  packagePrice: number;
  isHighlight?: boolean;
  className?: string;
}

export default function PackageRequestButton({
  packageName,
  packagePrice,
  isHighlight,
  className,
}: Props) {
  const [state, setState] = useState<'idle' | 'modal' | 'done'>('idle');
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setSending(true);
    try {
      await fetch('/api/package-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: packageName,
          package_price: packagePrice,
          notes: notes.trim() || null,
        }),
      });
      setState('done');
    } catch {
      alert('Er is iets misgegaan. Probeer opnieuw of neem contact op.');
    } finally {
      setSending(false);
    }
  };

  if (state === 'done') {
    return (
      <div className={`flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl text-sm font-semibold bg-green-500/20 text-green-700 ${className}`}>
        <CheckCircle size={16} />
        Aanvraag verzonden!
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setState('modal')}
        className={className}
      >
        Vraag offerte aan
      </button>

      <AnimatePresence>
        {state === 'modal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setState('idle')}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Offerte aanvragen</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Pakket <strong>{packageName}</strong> — €{packagePrice.toLocaleString('nl-BE')}
                  </p>
                </div>
                <button
                  onClick={() => setState('idle')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Optioneel bericht
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Extra informatie over je project, deadline, specifieke wensen..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-slate-400 resize-none transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setState('idle')}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {sending ? 'Verzenden...' : 'Aanvraag versturen'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <MessageSquare size={11} />
                  We nemen zo snel mogelijk contact op via je e-mailadres.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
