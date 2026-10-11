'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Euro } from 'lucide-react';

export interface PackageInfo {
  name: string;
  price: number;
  billing_interval: 'monthly' | 'one_time' | 'yearly';
}

interface Props {
  pkg: PackageInfo | null;
  onClose: () => void;
}

export default function PackageRequestModal({ pkg, onClose }: Props) {
  return pkg ? <OpenPackageRequestModal key={`${pkg.name}/${pkg.price}/${pkg.billing_interval}`} pkg={pkg} onClose={onClose} /> : null;
}

function OpenPackageRequestModal({ pkg, onClose }: { pkg: PackageInfo; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const en = lang === 'en';
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children).filter(el => el !== portal.current) as HTMLElement[];
    const inertStates = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const elements = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, a[href]') ?? []);
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = overflow;
      siblings.forEach((el, i) => { el.inert = inertStates[i]; });
      window.removeEventListener('keydown', handler);
      previousFocus?.focus();
    };
  }, [onClose]);

  const priceLabel = pkg
    ? `€${pkg.price.toLocaleString('nl-BE')} ${pkg.billing_interval === 'monthly' ? t.pricing.perMonth : pkg.billing_interval === 'yearly' ? (en ? '/ year' : '/ jaar') : t.pricing.oneTime}`
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/public/package-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name:  pkg.name,
          package_price: pkg.price,
          guest_name:    name.trim(),
          guest_email:   email.trim(),
          guest_phone:   phone.trim() || null,
          guest_company: company.trim() || null,
          notes:         notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Onbekende fout');
      }
      setSuccess(true);
    } catch {
      setError(en ? 'Your request could not be sent. Please try again or contact us.' : 'Je aanvraag kon niet worden verstuurd. Probeer opnieuw of neem contact op.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div ref={portal} className="[font-family:Arial,Helvetica,sans-serif]">
    <AnimatePresence>
      {pkg && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${id}-heading`}
              lang={en ? 'en' : 'nl-BE'}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] pointer-events-auto overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                    {en ? 'Request' : 'Aanvraag'}
                  </p>
                  <h2 id={`${id}-heading`} className="text-xl font-bold text-slate-900">{pkg.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                    <Euro size={13} />
                    <span>{priceLabel}</span>
                  </div>
                </div>
                <button
                  aria-label={en ? 'Close' : 'Sluiten'}
                  onClick={onClose}
                  className="min-h-11 min-w-11 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="mb-4 text-sm text-slate-600">{t.pricing.vatNote}</p>
                {success ? (
                  <div className="flex flex-col items-center text-center py-6 gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-1">
                      <CheckCircle size={30} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{en ? 'Request received!' : 'Aanvraag ontvangen!'}</h3>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                      {en ? 'We will contact you at' : 'We nemen contact op via'} <strong>{email}</strong>.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-3 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      {en ? 'Close' : 'Sluiten'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-slate-500 -mt-1">
                      {en ? 'Tell us what you need. This is a request, not a payment.' : 'Vertel wat je nodig hebt. Dit is een aanvraag, geen betaling.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`${id}-name`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {en ? 'Name' : 'Naam'} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          id={`${id}-name`}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jan Janssen"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${id}-email`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {en ? 'Email' : 'E-mail'} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          id={`${id}-email`}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={en ? 'name@company.be' : 'jan@bedrijf.be'}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${id}-phone`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {en ? 'Phone' : 'Telefoon'}
                        </label>
                        <input
                          type="tel"
                          id={`${id}-phone`}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+32 470 00 00 00"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor={`${id}-company`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                          {en ? 'Company' : 'Bedrijf'}
                        </label>
                        <input
                          type="text"
                          id={`${id}-company`}
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder={en ? 'My company' : 'Mijn BV'}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`${id}-notes`} className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {en ? 'Project details' : 'Extra toelichting'}
                      </label>
                      <textarea
                        id={`${id}-notes`}
                          value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder={en ? 'Tell us about your project or specific needs…' : 'Vertel kort over je project of specifieke noden…'}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
                      />
                    </div>

                    {error && (
                      <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}
                      {loading ? (en ? 'Sending…' : 'Verzenden…') : (en ? 'Send request' : 'Aanvraag versturen')}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      {en ? 'No account needed. Your details are used to follow up on this request.' : 'Geen account nodig. Je gegevens worden gebruikt om deze aanvraag op te volgen.'}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>, document.body,
  );
}
