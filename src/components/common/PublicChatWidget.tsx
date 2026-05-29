'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatWidget from '@/components/dashboard/ChatWidget';
import type { Profile } from '@/lib/types';

export default function PublicChatWidget() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data as Profile);
        });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) { setProfile(null); return; }
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data as Profile);
          else setProfile(null);
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dashboard heeft al een ChatWidget via DashboardShell
  if (pathname.startsWith('/dashboard')) return null;
  // Alleen voor ingelogde niet-admin gebruikers
  if (!profile || profile.role === 'admin') return null;

  return (
    <ChatProvider>
      <ChatWidget profile={profile} />
    </ChatProvider>
  );
}
