'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

// Extend Profile type locally to include new fields
interface ExtendedProfile extends Profile {
  company?: string;
  vat_number?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

const inputClass =
  'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 bg-white transition-all duration-200 placeholder:text-slate-400';
const disabledInputClass =
  'w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-400 bg-slate-50 cursor-not-allowed';
const labelClass = 'block mb-2 text-sm font-semibold text-slate-700';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    company: '',
    vat_number: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<ExtendedProfile>();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name ?? '',
          company: data.company ?? '',
          vat_number: data.vat_number ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          postal_code: data.postal_code ?? '',
          country: data.country ?? '',
        });
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    await supabase.from('profiles').update(form).eq('id', profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = profile
    ? (profile.full_name ?? profile.email)[0].toUpperCase()
    : '?';

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          <p className="font-medium text-slate-500">Profiel laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* ── Hero banner ── */}
      <div className="relative pb-24 overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 pt-14">
        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23ffffff' fill-opacity='0.06'/%3E%3C/svg%3E")`,
          }}
        />

        {/* gradient orbs */}
        <div className="absolute rounded-full pointer-events-none -top-32 -left-32 w-96 h-96 bg-blue-600/20 blur-3xl" />
        <div className="absolute rounded-full pointer-events-none -bottom-20 -right-20 w-80 h-80 bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 max-w-5xl px-6 mx-auto lg:px-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <ChevronLeft size={18} />
            Terug
          </Link>
          <motion.div {...fadeUp(0)} className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex items-center justify-center w-20 h-20 text-3xl font-bold text-white shadow-xl rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 shadow-blue-900/30">
                {initials}
              </div>
              {/* online dot */}
              <span className="absolute w-4 h-4 border-2 rounded-full -bottom-1 -right-1 bg-emerald-400 border-slate-900" />
            </div>

            <div>
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                {profile.full_name ?? 'Jouw Profiel'}
              </h1>
              <p className="mt-1 text-slate-400">{profile.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  profile.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {profile.role === 'admin' ? 'Administrator' : 'Gebruiker'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl px-6 pb-20 mx-auto -mt-8 lg:px-10">
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ── Persoonlijke gegevens ── */}
            <motion.div {...fadeUp(0.1)} className="lg:col-span-2">
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
                {/* card header */}
                <div className="flex items-center gap-3 py-5 border-b px-7 border-slate-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-slate-800">Persoonlijke gegevens</h2>
                </div>

                <div className="py-6 space-y-5 px-7">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Volledige naam</label>
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={handleChange('full_name')}
                        placeholder="Jan Janssen"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Telefoonnummer</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="+32 470 00 00 00"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>E-mail</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className={disabledInputClass}
                    />
                    <p className="text-xs text-slate-400 mt-1.5">E-mail kan niet worden gewijzigd</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Snelle info sidebar ── */}
            <motion.div {...fadeUp(0.15)} className="flex flex-col gap-6">
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-600">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-slate-800">Account status</h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Rol</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      profile.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {profile.role === 'admin' ? 'Admin' : 'Gebruiker'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Lid sinds</span>
                    <span className="text-sm font-medium text-slate-700">
                      {new Date(profile.created_at).toLocaleDateString('nl-BE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                      Actief
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Bedrijfsgegevens ── */}
            <motion.div {...fadeUp(0.2)} className="lg:col-span-2">
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
                <div className="flex items-center gap-3 py-5 border-b px-7 border-slate-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-slate-800">Bedrijfsgegevens</h2>
                </div>

                <div className="py-6 space-y-5 px-7">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Bedrijfsnaam</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={handleChange('company')}
                        placeholder="Mijn BV"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>BTW-nummer</label>
                      <input
                        type="text"
                        value={form.vat_number}
                        onChange={handleChange('vat_number')}
                        placeholder="BE 0123.456.789"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Adresgegevens ── */}
            <motion.div {...fadeUp(0.25)} className="lg:col-span-3">
              <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
                <div className="flex items-center gap-3 py-5 border-b px-7 border-slate-100">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-red-500">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-slate-800">Adresgegevens</h2>
                </div>

                <div className="py-6 space-y-5 px-7">
                  <div>
                    <label className={labelClass}>Straat & huisnummer</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={handleChange('address')}
                      placeholder="Kerkstraat 1"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Postcode</label>
                      <input
                        type="text"
                        value={form.postal_code}
                        onChange={handleChange('postal_code')}
                        placeholder="8000"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Gemeente</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={handleChange('city')}
                        placeholder="Brugge"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Land</label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={handleChange('country')}
                        placeholder="België"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Save button ── */}
            <motion.div {...fadeUp(0.3)} className="flex justify-end lg:col-span-3">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className="relative flex items-center justify-center gap-2 px-10 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-blue-500/25 disabled:opacity-70 min-w-52"
              >
                {saved ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Opgeslagen!
                  </>
                ) : saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  'Wijzigingen opslaan'
                )}
              </motion.button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}