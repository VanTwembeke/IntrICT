import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import NieuwsbriefClient from './NieuwsbriefClient';

export default async function NieuwsbriefPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  let newsletters: NewsletterRecord[] = [];
  try {
    const { data } = await admin
      .from('newsletters')
      .select('id, subject, headline, status, sent_at, recipient_count, created_at')
      .order('created_at', { ascending: false });
    newsletters = (data ?? []) as NewsletterRecord[];
  } catch { /* table may not exist yet */ }

  return <NieuwsbriefClient initialNewsletters={newsletters} />;
}

export interface NewsletterRecord {
  id: string;
  subject: string;
  headline: string;
  status: 'draft' | 'sent';
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}
