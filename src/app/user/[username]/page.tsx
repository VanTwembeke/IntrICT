'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!params?.username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const username = params.username.toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('public_username', username)
        .single();

      console.log('Public profile lookup:', { username, data, error });

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    };

    loadProfile();
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="pt-24">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] bg-slate-50">
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
              <p className="text-slate-600">Profiel laden...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="pt-24">
          <div className="px-4 py-20 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-slate-900">Gebruiker niet gevonden</h1>
            <p className="mt-4 text-slate-600">De pagina die je zoekt bestaat niet of de gebruikersnaam is niet geregistreerd.</p>
            <Link href="/" className="inline-flex items-center px-5 py-3 mt-8 font-semibold text-white transition bg-blue-600 rounded-full hover:bg-blue-700">
              Terug naar de homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = (profile.full_name ?? profile.email)[0].toUpperCase();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="pt-24">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft size={18} /> Terug naar startpagina
        </Link>

        <div className="mt-10 overflow-hidden bg-white border shadow-sm border-slate-200 rounded-3xl">
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-r from-blue-500 to-purple-600 opacity-20" />
            <div className="relative grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
              <div className="flex items-center justify-center mx-auto overflow-hidden rounded-full shadow-lg w-44 h-44 bg-slate-100 lg:mx-0">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name ?? profile.email}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-slate-700">{initials}</span>
                )}
              </div>

              <div className="space-y-4 text-center lg:text-left">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Publiek profiel</p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                    {profile.full_name ?? profile.email}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">{profile.company ?? 'Geen bedrijfsnaam opgegeven'}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 text-center rounded-3xl bg-slate-50">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Gebruikersnaam</div>
                    <div className="mt-3 text-base font-semibold text-slate-900">{profile.public_username ?? params.username}</div>
                  </div>
                  <div className="p-4 text-center rounded-3xl bg-slate-50">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Rol</div>
                    <div className="mt-3 text-base font-semibold text-slate-900">
                      {profile.role === 'admin' ? 'Admin' : profile.role === 'klant' ? 'Klant' : 'Gebruiker'}
                    </div>
                  </div>
                  <div className="p-4 text-center rounded-3xl bg-slate-50">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Klantnummer</div>
                    <div className="mt-3 text-base font-semibold text-slate-900">{profile.customer_number ?? 'Niet ingesteld'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 mt-10 sm:grid-cols-2">
              <div className="p-6 rounded-3xl bg-slate-50">
                <p className="text-sm font-semibold text-slate-500">E-mail</p>
                <p className="mt-3 text-base text-slate-900">{profile.email}</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50">
                <p className="text-sm font-semibold text-slate-500">Locatie</p>
                <p className="mt-3 text-base text-slate-900">{profile.city ?? 'Niet opgegeven'}</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
