'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

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
  show_public_email?: boolean | null;
  show_public_company?: boolean | null;
  show_public_location?: boolean | null;
  show_public_review?: boolean | null;
  review_score?: number | null;
  review_text?: string | null;

}

const inputClass =
  'w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 bg-white transition-all duration-200 placeholder:text-slate-400';
const disabledInputClass =
  'w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-400 bg-slate-50 cursor-not-allowed';
const labelClass = 'block mb-2 text-sm font-semibold text-slate-700';
const toggleLabel = 'flex items-center gap-3 text-sm font-medium text-slate-700';

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
    show_public_email: false,
    show_public_company: false,
    show_public_location: false,
    show_public_review: false,
    review_score: '',
    review_text: '',
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
          show_public_email: data.show_public_email ?? false,
          show_public_company: data.show_public_company ?? false,
          show_public_location: data.show_public_location ?? false,
          show_public_review: data.show_public_review ?? false,
          review_score: data.review_score?.toString() ?? '',
          review_text: data.review_text ?? '',
        });
      }
    };

    load();
  }, []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
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
      show_public_email: form.show_public_email,
      show_public_company: form.show_public_company,
      show_public_location: form.show_public_location,
      show_public_review: form.show_public_review,
      review_score: form.review_score ? Number(form.review_score) : null,
      review_text: form.review_text || null,
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
        show_public_email: updatedProfile.show_public_email ?? false,
        show_public_company: updatedProfile.show_public_company ?? false,
        show_public_location: updatedProfile.show_public_location ?? false,
        show_public_review: updatedProfile.show_public_review ?? false,
        review_score: updatedProfile.review_score?.toString() ?? '',
        review_text: updatedProfile.review_text ?? '',
      }));
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

  const initials = profile.full_name ? profile.full_name[0].toUpperCase() : profile.email[0].toUpperCase();

  const starPreview = Number(form.review_score) || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <section className="pt-24 pb-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-600">Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Profielinstellingen</h1>
              <p className="max-w-2xl mt-2 text-sm text-slate-500">Beheer je publieke profiel, privacy-instellingen en review over IntrICT.</p>
            </div>
            <div className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-slate-100">
                  {profile.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt={profile.full_name ?? profile.email} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xl font-semibold text-slate-700">{initials}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Publieke URL</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{profile.public_username ? `/user/${profile.public_username}` : 'Nog geen gebruikersnaam'}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200"
              >
                <div className="py-6 border-b px-7 border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Persoonlijke gegevens</h2>
                  <p className="mt-2 text-sm text-slate-500">Deze informatie gebruik je voor je account en openbare profiel.</p>
                </div>
                <div className="space-y-6 p-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Volledige naam</label>
                      <input type="text" value={form.full_name} onChange={handleChange('full_name')} placeholder="Jan Janssen" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Telefoonnummer</label>
                      <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+32 470 00 00 00" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>E-mail</label>
                    <input type="email" value={profile.email} disabled className={disabledInputClass} />
                    <p className="text-xs text-slate-400 mt-1.5">E-mail kan niet worden gewijzigd.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Profiel foto URL</label>
                    <input type="url" value={form.profile_picture_url} onChange={handleChange('profile_picture_url')} placeholder="https://voorbeeld.nl/foto.jpg" className={inputClass} />
                    <p className="text-xs text-slate-400 mt-1.5">Zichtbaar op jouw openbare profielpagina wanneer je dit toestaat.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Publieke gebruikersnaam</label>
                    <input type="text" value={form.public_username} onChange={handleChange('public_username')} placeholder="gebruikersnaam" className={inputClass} />
                    <p className="text-xs text-slate-400 mt-1.5">Kies een unieke gebruikersnaam voor jouw openbare URL: intrict.com/user/gebruikersnaam</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200"
              >
                <div className="py-6 border-b px-7 border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Adres & bedrijfsgegevens</h2>
                  <p className="mt-2 text-sm text-slate-500">Deze gegevens gebruiken wij alleen voor interne communicatie.</p>
                </div>
                <div className="space-y-6 p-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Bedrijfsnaam</label>
                      <input type="text" value={form.company} onChange={handleChange('company')} placeholder="Mijn BV" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>BTW-nummer</label>
                      <input type="text" value={form.vat_number} onChange={handleChange('vat_number')} placeholder="BE 0123.456.789" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Straat & huisnummer</label>
                    <input type="text" value={form.address} onChange={handleChange('address')} placeholder="Kerkstraat 1" className={inputClass} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <label className={labelClass}>Postcode</label>
                      <input type="text" value={form.postal_code} onChange={handleChange('postal_code')} placeholder="8000" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Gemeente</label>
                      <input type="text" value={form.city} onChange={handleChange('city')} placeholder="Brugge" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Land</label>
                      <input type="text" value={form.country} onChange={handleChange('country')} placeholder="België" className={inputClass} />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200"
              >
                <div className="py-6 border-b px-7 border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Accountinformatie</h2>
                  <p className="mt-2 text-sm text-slate-500">Deze gegevens zijn zichtbaar voor admins of alleen intern.</p>
                </div>
                <div className="space-y-6 p-7">
                  <div>
                    <label className={labelClass}>Klantnummer</label>
                    <input type="text" value={profile.customer_number ? profile.customer_number.toString() : 'Nog niet ingesteld'} disabled className={disabledInputClass} />
                    <p className="text-xs text-slate-400 mt-1.5">Kan alleen door een administrator worden aangepast.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <aside className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200"
              >
                <div className="py-6 border-b px-7 border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Privacy & zichtbaarheid</h2>
                  <p className="mt-2 text-sm text-slate-500">Kies welke onderdelen van je profiel publiek zichtbaar mogen zijn.</p>
                </div>
                <div className="space-y-4 p-7">
                  <label className={toggleLabel}>
                    <input type="checkbox" checked={form.show_public_email} onChange={handleChange('show_public_email')} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    Email openbaar tonen
                  </label>
                  <label className={toggleLabel}>
                    <input type="checkbox" checked={form.show_public_company} onChange={handleChange('show_public_company')} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    Bedrijfsnaam openbaar tonen
                  </label>
                  <label className={toggleLabel}>
                    <input type="checkbox" checked={form.show_public_location} onChange={handleChange('show_public_location')} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    Locatie openbaar tonen
                  </label>
                  <label className={toggleLabel}>
                    <input type="checkbox" checked={form.show_public_review} onChange={handleChange('show_public_review')} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    Review openbaar tonen
                  </label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200"
              >
                <div className="py-6 border-b px-7 border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">Review over IntrICT</h2>
                  <p className="mt-2 text-sm text-slate-500">Laat een beoordeling achter en update je score met sterren.</p>
                </div>
                <div className="space-y-5 p-7">
                  <div>
                    <label className={labelClass}>Review score</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={form.review_score}
                      onChange={handleChange('review_score')}
                      placeholder="1-5"
                      className={inputClass}
                    />
                    <div className="flex items-center gap-1 mt-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`w-5 h-5 ${index < starPreview ? 'text-amber-500' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Review tekst</label>
                    <textarea
                      value={form.review_text}
                      onChange={handleChange('review_text')}
                      placeholder="Vertel ons wat je van IntrICT vindt..."
                      rows={6}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="bg-white border shadow-sm rounded-3xl border-slate-200 p-7"
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center w-full gap-2 px-6 py-4 font-semibold text-white transition-all duration-300 bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-70"
                >
                  {saved ? 'Opgeslagen!' : saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </button>
              </motion.div>
            </aside>
          </form>
        </div>
      </section>
    </div>
  );
}
