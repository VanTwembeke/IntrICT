'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, History, ChevronDown, ChevronUp, Eye, X,
  Users, Mail, MousePointerClick, TrendingUp, Check, AlertCircle, Trash2,
} from 'lucide-react';
import type { NewsletterRecord } from './page';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
  deliveries?: number;
  opens?: number;
  clicks?: number;
  unsubscribed?: number;
  bounces?: number;
  complaints?: number;
}

interface StatsCache {
  recipient_count: number;
  metrics: Metrics | null;
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  subject: string;
  preheader: string;
  headline: string;
  body: string;
  feature_title: string;
  feature_body: string;
  cta_text: string;
  cta_url: string;
}

const EMPTY: FormState = {
  subject: '',
  preheader: '',
  headline: '',
  body: '',
  feature_title: '',
  feature_body: '',
  cta_text: '',
  cta_url: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-white text-sm placeholder:text-slate-400 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function pct(n?: number, total?: number) {
  if (!n || !total) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ form, onClose }: { form: FormState; onClose: () => void }) {
  const paragraphs = form.body.split(/\n\n+/).filter(Boolean);
  const date = new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-full items-start justify-center p-4 py-10">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl"
        >
          {/* Preview toolbar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-white">E-mail voorbeeld</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Rendered email preview */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-10 py-7" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight">IntrICT</span>
                  <span className="ml-2 text-xs text-white/50 font-medium">Nieuwsbrief</span>
                </div>
                <span className="text-xs text-white/40">{date}</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-10 py-8">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight mb-5">
                {form.headline || <span className="text-slate-300">Koptekst…</span>}
              </h1>
              {paragraphs.length > 0
                ? paragraphs.map((p, i) => <p key={i} className="text-sm text-slate-500 leading-relaxed mb-4">{p}</p>)
                : <p className="text-sm text-slate-300">Inhoud…</p>}
            </div>

            {/* Feature block */}
            {form.feature_title && (
              <div className="px-10 pb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Uitgelicht</p>
                  <h2 className="text-lg font-bold text-slate-800 mb-2">{form.feature_title}</h2>
                  {form.feature_body && <p className="text-sm text-slate-500 leading-relaxed">{form.feature_body}</p>}
                </div>
              </div>
            )}

            {/* CTA */}
            {form.cta_text && (
              <div className="px-10 pb-8 text-center">
                <span className="inline-block px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-xl">
                  {form.cta_text} →
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="px-10 py-5 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400">Je ontvangt dit omdat je ingeschreven bent voor de IntrICT nieuwsbrief.</p>
              <p className="text-xs text-slate-400 mt-1">
                <span className="underline text-slate-500">Uitschrijven</span> · <span className="underline text-slate-500">intrict.com</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ newsletter }: { newsletter: NewsletterRecord }) {
  const [stats, setStats] = useState<StatsCache | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (stats) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${newsletter.id}/stats`);
      const data = await res.json();
      setStats(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  if (!stats && !loading) load();

  const m = stats?.metrics;
  const total = stats?.recipient_count ?? newsletter.recipient_count ?? 0;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
          Statistieken laden…
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<Users size={14} />} label="Ontvangers" value={String(total)} color="blue" />
          <StatCard icon={<Mail size={14} />} label="Geopend" value={m ? `${m.opens ?? 0} (${pct(m.opens, total)})` : '—'} color="emerald" />
          <StatCard icon={<MousePointerClick size={14} />} label="Geklikt" value={m ? `${m.clicks ?? 0} (${pct(m.clicks, total)})` : '—'} color="indigo" />
          <StatCard icon={<TrendingUp size={14} />} label="Afgemeld" value={m ? `${m.unsubscribed ?? 0}` : '—'} color="amber" />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-slate-50 rounded-xl p-3.5">
      <div className={`inline-flex p-1.5 rounded-lg mb-2 ${colors[color]}`}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ newsletter }: { newsletter: NewsletterRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2 bg-blue-50 rounded-xl shrink-0">
            <Mail size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate text-sm">{newsletter.subject}</p>
            <p className="text-xs text-slate-400 mt-0.5">{fmtDate(newsletter.sent_at)} · {newsletter.recipient_count ?? '?'} ontvangers</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
            <Check size={10} /> Verzonden
          </span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <StatsPanel newsletter={newsletter} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Composer ─────────────────────────────────────────────────────────────────

function Composer({ onSent }: { onSent: (n: NewsletterRecord) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.subject,
          preheader: form.preheader || undefined,
          headline: form.headline,
          body: form.body,
          feature_title: form.feature_title || undefined,
          feature_body: form.feature_body || undefined,
          cta_text: form.cta_text || undefined,
          cta_url: form.cta_url || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Verzenden mislukt.');
      setSuccess(true);
      setConfirm(false);
      setForm(EMPTY);
      if (data.newsletter) onSent(data.newsletter as NewsletterRecord);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
      setConfirm(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Nieuwe nieuwsbrief</h2>
          <p className="text-sm text-slate-500 mt-0.5">Vul de velden in — de opmaak wordt automatisch verzorgd.</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Subject + preheader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Onderwerp *</label>
              <input required type="text" value={form.subject} onChange={set('subject')} placeholder="Maandelijkse update — april 2026" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preheader <span className="normal-case font-normal text-slate-400">(preview in inbox)</span></label>
              <input type="text" value={form.preheader} onChange={set('preheader')} placeholder="Kort wat je mag verwachten…" className={inputClass} />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className={labelClass}>Koptekst *</label>
            <input required type="text" value={form.headline} onChange={set('headline')} placeholder="Grote titel bovenaan de e-mail" className={inputClass} />
          </div>

          {/* Body */}
          <div>
            <label className={labelClass}>Inhoud * <span className="normal-case font-normal text-slate-400">(lege regel = nieuwe alinea)</span></label>
            <textarea
              required rows={8} value={form.body} onChange={set('body')}
              placeholder={"Eerste alinea van je nieuwsbrief…\n\nTweede alinea…\n\nDerde alinea…"}
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Feature block */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Uitgelicht blok <span className="normal-case font-normal">(optioneel)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titel</label>
                <input type="text" value={form.feature_title} onChange={set('feature_title')} placeholder="Titel van uitgelicht item" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Inhoud</label>
                <textarea rows={2} value={form.feature_body} onChange={set('feature_body')} placeholder="Korte beschrijving…" className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Call-to-action knop <span className="normal-case font-normal">(optioneel)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Knoptekst</label>
                <input type="text" value={form.cta_text} onChange={set('cta_text')} placeholder="Lees meer" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL</label>
                <input type="url" value={form.cta_url} onChange={set('cta_url')} placeholder="https://intrict.com/blog/…" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"
            >
              <Check size={15} className="shrink-0" />
              Nieuwsbrief succesvol verzonden!
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <Eye size={15} />
              Voorbeeld
            </button>
            <button
              type="button"
              disabled={!form.subject || !form.headline || !form.body}
              onClick={() => setConfirm(true)}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <Send size={15} />
              Versturen
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {preview && <PreviewModal form={form} onClose={() => setPreview(false)} />}
      </AnimatePresence>

      {/* Confirm send modal */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Send size={20} className="text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Nieuwsbrief versturen?</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Je staat op het punt om <strong>&ldquo;{form.subject}&rdquo;</strong> te versturen naar alle abonnees. Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                  Annuleren
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
                >
                  {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                  {sending ? 'Verzenden…' : 'Versturen'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Subscriber list ──────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

function SubscriberList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/newsletter/subscribers')
      .then((r) => r.json())
      .then((data) => setSubscribers(data))
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Abonnee definitief verwijderen?')) return;
    setDeletingId(id);
    try {
      await fetch('/api/admin/newsletter/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const active = subscribers?.filter((s) => s.is_active) ?? [];
  const inactive = subscribers?.filter((s) => !s.is_active) ?? [];

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Actief ingeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : active.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Uitgeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : inactive.length}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 p-8 bg-white border border-slate-200 rounded-2xl justify-center text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
          Laden…
        </div>
      )}

      {!loading && subscribers.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Nog geen abonnees.</p>
        </div>
      )}

      {!loading && subscribers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Ingeschreven op</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.email}</td>
                  <td className="px-5 py-3">
                    {s.is_active
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><Check size={10} />Actief</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Uitgeschreven</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      title="Verwijderen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface Props {
  initialNewsletters: NewsletterRecord[];
}

export default function NieuwsbriefClient({ initialNewsletters }: Props) {
  const [tab, setTab] = useState<'compose' | 'history' | 'subscribers'>('compose');
  const [newsletters, setNewsletters] = useState<NewsletterRecord[]>(initialNewsletters);

  const lastSent = newsletters.find((n) => n.sent_at);
  const totalSent = newsletters.length;

  const handleSent = (n: NewsletterRecord) => {
    setNewsletters((prev) => [n, ...prev]);
    setTab('history');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Nieuwsbrief</h1>
        <p className="text-sm text-slate-500 mt-1">Stel maandelijkse updates op en verstuur ze naar alle abonnees.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Totaal verzonden</p>
          <p className="text-2xl font-bold text-slate-900">{totalSent}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Laatste uitzending</p>
          <p className="text-sm font-semibold text-slate-800">
            {lastSent ? new Date(lastSent.sent_at!).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 mb-1">Totale bereik</p>
          <p className="text-2xl font-bold text-slate-900">
            {newsletters.reduce((acc, n) => acc + (n.recipient_count ?? 0), 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {([
          ['compose', 'Nieuwe nieuwsbrief', <Send key="s" size={14} />],
          ['history', `Geschiedenis (${totalSent})`, <History key="h" size={14} />],
          ['subscribers', 'Abonnees', <Users key="u" size={14} />],
        ] as const).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'compose' && <Composer onSent={handleSent} />}

      {tab === 'history' && (
        <div>
          {newsletters.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Mail size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Nog geen nieuwsbrieven verzonden.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsletters.map((n) => <HistoryCard key={n.id} newsletter={n} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'subscribers' && <SubscriberList />}
    </div>
  );
}
