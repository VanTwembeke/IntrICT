'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? '');
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!profile) {
    return (
      <div className="p-6 lg:p-10">
        <p className="text-slate-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Mijn profiel</h1>
        <p className="text-slate-500 mt-1">Beheer je persoonlijke gegevens</p>
      </div>

      <div className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {(profile.full_name ?? profile.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">{profile.full_name ?? '—'}</p>
              <p className="text-slate-500 text-sm">{profile.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                profile.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {profile.role === 'admin' ? 'Administrator' : 'Gebruiker'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-semibold text-slate-700">
                Volledige naam
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-slate-400 bg-slate-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">E-mail kan niet worden gewijzigd</p>
            </div>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="w-full py-3 font-semibold text-white bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-lg transition-all duration-300 disabled:opacity-70"
            >
              {saved ? 'Opgeslagen!' : saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
