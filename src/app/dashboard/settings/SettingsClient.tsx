'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Shield, Bell, Eye, EyeOff, Check, AlertCircle,
  Loader2, Mail, Package, Zap, Globe,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateNewsletterSubscription } from '@/app/actions/newsletter';
import type { NotificationPreferences, Profile } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ResolvedPrefs = Required<NotificationPreferences>;

const DEFAULT_PREFS: ResolvedPrefs = {
  email_messages:     true,
  email_invoices:     true,
  email_appointments: true,
  newsletter:         false,
};

function resolvePrefs(raw: NotificationPreferences | null | undefined): ResolvedPrefs {
  return { ...DEFAULT_PREFS, ...(raw ?? {}) };
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ─── Inline status message ────────────────────────────────────────────────────

function StatusMsg({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 text-sm mt-3 ${
      msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'
    }`}>
      {msg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg.text}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsClient({ profile }: { profile: Profile }) {
  const supabase = useRef(createClient()).current;
  const isAdmin = profile.role === 'admin';

  // ── Password ─────────────────────────────────────────────────────────────
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'Wachtwoord moet minimaal 8 tekens zijn.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Wachtwoorden komen niet overeen.' });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      setPwMsg({ type: 'error', text: error.message });
    } else {
      setPwMsg({ type: 'success', text: 'Wachtwoord succesvol gewijzigd.' });
      setNewPw('');
      setConfirmPw('');
    }
  }

  // ── Notification preferences ─────────────────────────────────────────────
  const [prefs, setPrefs]               = useState<ResolvedPrefs>(resolvePrefs(profile.notification_preferences));
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsMsg, setPrefsMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleToggle(key: keyof ResolvedPrefs, value: boolean) {
    const prev = prefs;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated); // optimistic
    setPrefsLoading(true);
    setPrefsMsg(null);

    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', profile.id);

    if (error) {
      setPrefs(prev); // revert
      setPrefsMsg({ type: 'error', text: 'Kon voorkeur niet opslaan.' });
      setPrefsLoading(false);
      return;
    }

    if (key === 'newsletter') {
      const result = await updateNewsletterSubscription(profile.email, value);
      if (!result.success) {
        setPrefsMsg({ type: 'error', text: result.error ?? 'Nieuwsbrief kon niet worden bijgewerkt.' });
        setPrefsLoading(false);
        return;
      }
    }

    setPrefsLoading(false);
    setPrefsMsg({ type: 'success', text: 'Voorkeur opgeslagen.' });
    setTimeout(() => setPrefsMsg(null), 3000);
  }

  const notifRows: { key: keyof ResolvedPrefs; label: string; desc: string }[] = [
    { key: 'email_messages',     label: 'Berichten',  desc: 'E-mail bij een nieuw gespreksbericht' },
    { key: 'email_invoices',     label: 'Facturen',   desc: 'E-mail bij een nieuwe of gewijzigde factuur' },
    { key: 'email_appointments', label: 'Afspraken',  desc: 'Herinnering bij een aankomende afspraak' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          {isAdmin ? 'Administrator' : 'Gebruiker'}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Instellingen</h1>
      </div>

      {/* ── Account card ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">
          Huidig account
        </h2>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {(profile.full_name ?? profile.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{profile.full_name ?? 'Gebruiker'}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {isAdmin ? 'Administrator' : 'Gebruiker'}
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md shrink-0"
          >
            Profiel bewerken
          </Link>
        </div>
      </section>

      {/* ── Password ─────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">
          Beveiliging
        </h2>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-purple-50 rounded-xl shrink-0">
              <Shield size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Wachtwoord wijzigen</p>
              <p className="text-sm text-slate-500">Kies een sterk wachtwoord van minimaal 8 tekens.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nieuw wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Minimaal 8 tekens"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-11 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Herhaal nieuw wachtwoord
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Zelfde wachtwoord"
                autoComplete="new-password"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading || !newPw || !confirmPw}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
              Wachtwoord wijzigen
            </button>

            <StatusMsg msg={pwMsg} />
          </form>
        </div>
      </section>

      {/* ── Notifications ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">
          E-mailmeldingen
        </h2>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl divide-y divide-slate-100">
          {notifRows.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <Bell size={15} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
              <Toggle
                checked={prefs[key]}
                onChange={v => handleToggle(key, v)}
                disabled={prefsLoading}
              />
            </div>
          ))}

          {/* Newsletter — separate visual treatment */}
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                <Mail size={15} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Nieuwsbrief</p>
                <p className="text-xs text-slate-500">IntrICT tips, updates en nieuws</p>
              </div>
            </div>
            <Toggle
              checked={prefs.newsletter}
              onChange={v => handleToggle('newsletter', v)}
              disabled={prefsLoading}
            />
          </div>
        </div>
        <StatusMsg msg={prefsMsg} />
      </section>

      {/* ── Integrations (admin only) ─────────────────────────────────────────── */}
      {isAdmin && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-4">
            Integraties
          </h2>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl divide-y divide-slate-100">
            {([
              { Icon: Mail,    bg: 'bg-emerald-50', iconClass: 'text-emerald-600', label: 'Resend',    desc: 'E-mail & nieuwsbrieven' },
              { Icon: Zap,     bg: 'bg-green-50',   iconClass: 'text-green-600',   label: 'Supabase', desc: 'Database & authenticatie' },
              { Icon: Globe,   bg: 'bg-slate-50',   iconClass: 'text-slate-600',   label: 'Vercel',   desc: 'Hosting & deployment' },
              { Icon: Package, bg: 'bg-blue-50',    iconClass: 'text-blue-600',    label: 'Lucide',   desc: 'Icoon bibliotheek' },
            ] as const).map(({ Icon, bg, iconClass, label, desc }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className={`p-2 ${bg} rounded-lg shrink-0`}>
                  <Icon size={16} className={iconClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Actief
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
