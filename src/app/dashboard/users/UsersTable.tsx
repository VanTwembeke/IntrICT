'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, User, X, Save, Mail, Calendar, Edit2, ChevronRight,
  UserPlus, KeyRound, Eye, EyeOff, Loader2, Check, Copy,
} from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  users: Profile[];
  currentUserId: string;
}

interface EditFormState {
  full_name: string;
  phone: string;
  company: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  profile_picture_url: string;
  public_username: string;
  customer_number: string;
  role: UserRole;
}

interface CreateFormState {
  email: string;
  password: string;
  full_name: string;
  company: string;
  phone: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
}

type CreateMode = 'invite' | 'direct';

const EMPTY_CREATE: CreateFormState = {
  email: '', password: '', full_name: '', company: '',
  phone: '', vat_number: '', address: '', postal_code: '', city: '',
};

const inputClass =
  'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm transition-all placeholder:text-slate-400';

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (profile: Profile) => void;
}) {
  const [mode, setMode]     = useState<CreateMode>('invite');
  const [form, setForm]     = useState<CreateFormState>(EMPTY_CREATE);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof CreateFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'invite' ? '/api/admin/invite-client' : '/api/admin/create-user';
    const body = {
      email:       form.email,
      ...(mode === 'direct' && { password: form.password }),
      ...(form.full_name   && { full_name:   form.full_name }),
      ...(form.company     && { company:     form.company }),
      ...(form.phone       && { phone:       form.phone }),
      ...(form.vat_number  && { vat_number:  form.vat_number }),
      ...(form.address     && { address:     form.address }),
      ...(form.postal_code && { postal_code: form.postal_code }),
      ...(form.city        && { city:        form.city }),
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? 'Er is iets misgegaan.'); return; }

    setSuccess(true);
    setTimeout(() => onCreated({
      id:          data.user_id,
      email:       form.email,
      full_name:   form.full_name   || null,
      company:     form.company     || null,
      phone:       form.phone       || null,
      vat_number:  form.vat_number  || null,
      address:     form.address     || null,
      postal_code: form.postal_code || null,
      city:        form.city        || null,
      role:        'user',
      created_at:  new Date().toISOString(),
    }), 1400);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <UserPlus size={18} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Nieuwe gebruiker</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <Check size={24} className="text-green-500" />
              </div>
              <p className="font-semibold text-slate-800">
                {mode === 'invite' ? 'Uitnodiging verstuurd!' : 'Gebruiker aangemaakt!'}
              </p>
              <p className="text-sm text-slate-400">
                {mode === 'invite'
                  ? `Een uitnodigingsmail is verstuurd naar ${form.email}`
                  : `${form.email} kan nu direct inloggen met het opgegeven wachtwoord`}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(['invite', 'direct'] as CreateMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); }}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'invite' ? '✉\u00a0 Uitnodigen' : '⚡\u00a0 Direct aanmaken'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 -mt-1">
                {mode === 'invite'
                  ? 'Verstuurt een uitnodigingsmail. De gebruiker stelt zelf zijn wachtwoord in.'
                  : 'Maakt het account direct actief zonder e-mail. Deel het wachtwoord zelf.'}
              </p>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mailadres *</label>
                <input required type="email" value={form.email} onChange={set('email')}
                  placeholder="gebruiker@bedrijf.be" className={inputClass} />
              </div>

              {/* Password — direct mode only */}
              {mode === 'direct' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wachtwoord *</label>
                  <div className="relative">
                    <input required type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={set('password')} placeholder="Minimaal 8 tekens" minLength={8}
                      className={`${inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Volledige naam</label>
                <input type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="Jan Janssen" className={inputClass} />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bedrijf</label>
                <input type="text" value={form.company} onChange={set('company')}
                  placeholder="Bedrijfsnaam" className={inputClass} />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefoonnummer</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+32 495 00 00 00" className={inputClass} />
              </div>

              {/* Error */}
              {error && (
                <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">
                  <X size={14} className="shrink-0" />{error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                  Annuleren
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  {loading ? 'Bezig...' : mode === 'invite' ? 'Uitnodiging sturen' : 'Aanmaken'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Reset Link Modal ─────────────────────────────────────────────────────────

function ResetLinkModal({
  link,
  email,
  onClose,
}: { link: string; email: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <KeyRound size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Resetlink kopiëren</h2>
            <p className="text-xs text-slate-400">E-mail kon niet worden verstuurd naar {email}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Kopieer de link hieronder en stuur hem zelf door aan de gebruiker. De link is 24 uur geldig.
        </p>
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
          <p className="text-xs text-slate-600 truncate flex-1 font-mono">{link}</p>
          <button
            onClick={copy}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Gekopieerd' : 'Kopieer'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          Sluiten
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UsersTable({ users: initial, currentUserId }: Props) {
  const [users, setUsers]         = useState(initial);
  const [saving, setSaving]       = useState<string | null>(null);
  const [editUser, setEditUser]   = useState<Profile | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<{ email: string; link: string } | null>(null);
  const [toast, setToast]         = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<EditFormState>({
    full_name: '', phone: '', company: '', vat_number: '',
    address: '', postal_code: '', city: '', country: '',
    profile_picture_url: '', public_username: '', customer_number: '', role: 'user',
  });
  const [editSaving, setEditSaving]   = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setEditForm({
      full_name:           u.full_name ?? '',
      phone:               u.phone ?? '',
      company:             u.company ?? '',
      vat_number:          u.vat_number ?? '',
      address:             u.address ?? '',
      postal_code:         u.postal_code ?? '',
      city:                u.city ?? '',
      country:             u.country ?? '',
      profile_picture_url: u.profile_picture_url ?? '',
      public_username:     u.public_username ?? '',
      customer_number:     u.customer_number?.toString() ?? '',
      role:                u.role as UserRole,
    });
    setEditSuccess(false);
  };

  const closeEdit = () => { setEditUser(null); setEditSuccess(false); };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      full_name:           editForm.full_name || null,
      phone:               editForm.phone || null,
      company:             editForm.company || null,
      vat_number:          editForm.vat_number || null,
      address:             editForm.address || null,
      postal_code:         editForm.postal_code || null,
      city:                editForm.city || null,
      country:             editForm.country || null,
      profile_picture_url: editForm.profile_picture_url || null,
      public_username:     editForm.public_username || null,
      customer_number:     editForm.customer_number ? Number(editForm.customer_number) : null,
      role:                editForm.role,
    }).eq('id', editUser.id);

    setUsers(prev => prev.map(u =>
      u.id === editUser.id
        ? { ...u, full_name: editForm.full_name || null, phone: editForm.phone || null, company: editForm.company || null, vat_number: editForm.vat_number || null, address: editForm.address || null, postal_code: editForm.postal_code || null, city: editForm.city || null, country: editForm.country || null, profile_picture_url: editForm.profile_picture_url || null, public_username: editForm.public_username || null, customer_number: editForm.customer_number ? Number(editForm.customer_number) : null, role: editForm.role }
        : u
    ));
    setEditSaving(false);
    setEditSuccess(true);
    setTimeout(() => closeEdit(), 1500);
  };

  const updateRole = async (userId: string, role: UserRole) => {
    setSaving(userId);
    const supabase = createClient();
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setSaving(null);
  };

  const handleResetPassword = async (userId: string, email: string) => {
    setResetLoading(userId);
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setResetLoading(null);

    if (!res.ok) { showToast(`Fout: ${data.error}`); return; }

    if (data.link) {
      setResetLink({ email, link: data.link });
    } else {
      showToast(`Resetlink verstuurd naar ${email}`);
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role !== 'admin').length;

  return (
    <div className="p-6 lg:p-8">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Administrator</p>
          <h1 className="text-3xl font-bold text-slate-900">Gebruikers</h1>
          <p className="text-sm text-slate-500 mt-1">
            {adminCount} admin{adminCount !== 1 ? 's' : ''} · {userCount} gebruiker{userCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Nieuwe gebruiker
        </button>
      </div>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-blue-600">
                    {(editUser.full_name ?? editUser.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Gebruiker bewerken</h2>
                    <p className="text-xs text-slate-500">{editUser.email}</p>
                  </div>
                </div>
                <button onClick={closeEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {editSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex items-center justify-center rounded-full w-14 h-14 bg-green-50">
                      <Save size={24} className="text-green-500" />
                    </div>
                    <p className="font-semibold text-slate-800">Wijzigingen opgeslagen!</p>
                  </motion.div>
                ) : (
                  <>
                    {[
                      { label: 'Volledige naam', field: 'full_name' as const, type: 'text', placeholder: 'Naam van de gebruiker' },
                    ].map(({ label, field, type, placeholder }) => (
                      <div key={field}>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700">{label}</label>
                        <input type={type} value={editForm[field]} onChange={e => setEditForm({...editForm, [field]: e.target.value})}
                          placeholder={placeholder} className={inputClass} />
                      </div>
                    ))}

                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                        E-mailadres <span className="ml-1.5 text-xs font-normal text-slate-400">(alleen-lezen)</span>
                      </label>
                      <input type="email" value={editUser?.email ?? ''} disabled
                        className="w-full px-4 py-3 border-2 cursor-not-allowed border-slate-100 rounded-xl bg-slate-50 text-slate-400 text-sm" />
                    </div>

                    {([
                      { label: 'Profiel foto URL', field: 'profile_picture_url' as const, type: 'url', placeholder: 'https://voorbeeld.nl/foto.jpg' },
                      { label: 'Publieke gebruikersnaam', field: 'public_username' as const, type: 'text', placeholder: 'gebruikersnaam' },
                      { label: 'Klantnummer', field: 'customer_number' as const, type: 'text', placeholder: '100001' },
                      { label: 'Telefoonnummer', field: 'phone' as const, type: 'tel', placeholder: '+32 6 12345678' },
                      { label: 'Bedrijfsnaam', field: 'company' as const, type: 'text', placeholder: 'Bedrijfsnaam' },
                      { label: 'BTW-nummer', field: 'vat_number' as const, type: 'text', placeholder: 'BE0123456789' },
                      { label: 'Adres', field: 'address' as const, type: 'text', placeholder: 'Straatnaam 123' },
                      { label: 'Postcode', field: 'postal_code' as const, type: 'text', placeholder: '1000' },
                      { label: 'Stad', field: 'city' as const, type: 'text', placeholder: 'Brussel' },
                      { label: 'Land', field: 'country' as const, type: 'text', placeholder: 'België' },
                    ] as { label: string; field: keyof EditFormState; type: string; placeholder: string }[]).map(({ label, field, type, placeholder }) => (
                      <div key={field}>
                        <label className="block mb-1.5 text-sm font-semibold text-slate-700">{label}</label>
                        <input type={type} value={editForm[field] as string} onChange={e => setEditForm({...editForm, [field]: e.target.value})}
                          placeholder={placeholder} className={inputClass} />
                        {field === 'public_username' && (
                          <p className="mt-1 text-xs text-slate-400">Openbare URL: intrict.com/user/{editForm.public_username || 'gebruikersnaam'}</p>
                        )}
                      </div>
                    ))}

                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Rol</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['user', 'admin'] as UserRole[]).map(r => (
                          <button key={r} onClick={() => setEditForm({...editForm, role: r})}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                              editForm.role === r
                                ? r === 'admin' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {r === 'admin' ? <Shield size={15} /> : <User size={15} />}
                            {r === 'admin' ? 'Admin' : 'Gebruiker'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={closeEdit}
                        className="flex-1 py-3 text-sm font-semibold transition-all border-2 text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50">
                        Annuleren
                      </button>
                      <motion.button whileHover={{ scale: editSaving ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSaveEdit} disabled={editSaving}
                        className="flex items-center justify-center flex-1 gap-2 py-3 text-sm font-semibold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                        <Save size={14} />
                        {editSaving ? 'Opslaan...' : 'Opslaan'}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create user modal */}
        {showCreate && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
            onCreated={profile => {
              setUsers(prev => [profile, ...prev]);
              setShowCreate(false);
              showToast('Gebruiker toegevoegd');
            }}
          />
        )}

        {/* Reset link fallback modal */}
        {resetLink && (
          <ResetLinkModal
            email={resetLink.email}
            link={resetLink.link}
            onClose={() => setResetLink(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Totaal',      value: users.length, color: 'text-slate-800' },
          { label: 'Admins',      value: adminCount,   color: 'text-purple-600' },
          { label: 'Gebruikers',  value: userCount,    color: 'text-blue-600' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100">
            <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50 border-slate-100">
                {['Gebruiker', 'Rol', 'Lid sinds', 'Acties'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="transition-colors hover:bg-slate-50/70 group">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-blue-600 shrink-0">
                        {(u.full_name ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          {u.full_name ?? '—'}
                          {u.id === currentUserId && <span className="text-xs font-medium text-blue-400">(jij)</span>}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <Mail size={10} />{u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                      {u.role === 'admin' ? 'Admin' : 'Gebruiker'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar size={12} className="text-slate-300" />
                      {new Date(u.created_at).toLocaleDateString('nl-BE')}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => openEdit(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        <Edit2 size={12} />Bewerken
                      </button>

                      {/* Reset password */}
                      <button
                        onClick={() => handleResetPassword(u.id, u.email)}
                        disabled={resetLoading === u.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-60"
                      >
                        {resetLoading === u.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <KeyRound size={12} />}
                        Resetlink
                      </button>

                      {/* Role toggle */}
                      {u.id !== currentUserId && (
                        u.role !== 'admin' ? (
                          <button onClick={() => updateRole(u.id, 'admin')} disabled={saving === u.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-60">
                            <Shield size={12} />
                            {saving === u.id ? 'Opslaan...' : 'Admin maken'}
                          </button>
                        ) : (
                          <button onClick={() => updateRole(u.id, 'user')} disabled={saving === u.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60">
                            <User size={12} />
                            {saving === u.id ? 'Opslaan...' : 'Gebruiker maken'}
                          </button>
                        )
                      )}

                      <ChevronRight size={14} className="ml-auto transition-colors text-slate-200 group-hover:text-slate-400" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-lg"
          >
            <Check size={16} className="text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
