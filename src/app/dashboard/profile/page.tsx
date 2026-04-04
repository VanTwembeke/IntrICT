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
  profile_picture_url?: string;
  public_username?: string;
  customer_number?: number;
  updated_at?: string;
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
    profile_picture_url: '',
    public_username: '',
    customer_number: '',
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
          profile_picture_url: data.profile_picture_url ?? '',
          public_username: data.public_username ?? '',
          customer_number: data.customer_number?.toString() ?? '',
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

    const username = form.public_username.trim();
    if (username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('public_username', username)
        .single();

      if (existing && existing.id !== profile.id) {
        window.alert('Deze gebruikersnaam is al in gebruik. Kies een andere gebruikersnaam.');
        setSaving(false);
        return;
      }
    }

    const normalizedUsername = username ? username.toLowerCase() : '';
    const updatePayload: Record<string, unknown> = {
      full_name: form.full_name,
      company: form.company,
      vat_number: form.vat_number,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      country: form.country,
      profile_picture_url: form.profile_picture_url,
      public_username: normalizedUsername || null,
    };

    if (profile.role === 'admin') {
      updatePayload.customer_number = form.customer_number ? Number(form.customer_number) : null;
    } else {
      updatePayload.customer_number = profile.customer_number ?? null;
    }

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', profile.id)
      .select()
      .single<ExtendedProfile>();

    if (error) {
      console.error('Profile update failed', error);
      window.alert('Er is iets misgegaan bij het opslaan van je profiel. Probeer het opnieuw.');
      setSaving(false);
      return;
    }

    if (updatedProfile) {
      setProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        profile_picture_url: updatedProfile.profile_picture_url ?? '',
        public_username: updatedProfile.public_username ?? '',
        customer_number: updatedProfile.customer_number?.toString() ?? '',
      }));
    }

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

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+")`,
            }}
          />
        </div>
        <div className="absolute rounded-full pointer-events-none -right-24 -top-24 h-80 w-80 bg-blue-600/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-16 left-1/4 bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 transition-colors text-slate-300 hover:text-white"
            >
              <ChevronLeft size={20} />
              <span>Terug naar Dashboard</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Jouw{' '}
              <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                Profiel
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
              Beheer je persoonlijke informatie en bedrijfsinstellingen.
              Houd je profiel up-to-date voor betere communicatie.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
              {profile.profile_picture_url ? (
                <div className="relative overflow-hidden rounded-full shadow-xl w-28 h-28 ring-4 ring-white">
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name ?? profile.email}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center text-3xl font-bold text-white rounded-full shadow-xl w-28 h-28 bg-white/10 ring-4 ring-white">
                  {initials}
                </div>
              )}

              {[
                {
                  label: 'Account Type',
                  value:
                    profile.role === 'admin'
                      ? 'Admin'
                      : profile.role === 'klant'
                      ? 'Klant'
                      : 'Gebruiker',
                },
                { label: 'Laatste Update', value: new Date(profile.updated_at ?? profile.created_at).toLocaleDateString('nl-NL') },
                { label: 'Status', value: 'Actief' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Profile Interface ────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* ── Persoonlijke gegevens ── */}
              <motion.div {...fadeUp(0.1)} className="lg:col-span-2">
                <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
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

                    <div>
                      <label className={labelClass}>Profiel foto URL</label>
                      <input
                        type="url"
                        value={form.profile_picture_url}
                        onChange={handleChange('profile_picture_url')}
                        placeholder="https://voorbeeld.nl/foto.jpg"
                        className={inputClass}
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Zichtbaar op jouw openbare gebruikerspagina.</p>
                    </div>

                    <div>
                      <label className={labelClass}>Publieke gebruikersnaam</label>
                      <input
                        type="text"
                        value={form.public_username}
                        onChange={handleChange('public_username')}
                        placeholder="gebruikersnaam"
                        className={inputClass}
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Kies een unieke gebruikersnaam voor jouw openbare URL: intrict.com/user/gebruikersnaam</p>
                    </div>

                    <div>
                      <label className={labelClass}>Klantnummer</label>
                      <input
                        type="text"
                        value={profile.customer_number ? profile.customer_number.toString() : 'Nog niet ingesteld'}
                        disabled
                        className={disabledInputClass}
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Dit nummer kan alleen door een administrator worden aangepast.</p>
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
                          : profile.role === 'klant'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {profile.role === 'admin'
                          ? 'Admin'
                          : profile.role === 'klant'
                          ? 'Klant'
                          : 'Gebruiker'}
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
      </section>

    </div>
  );
}