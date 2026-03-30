import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ emails: [] });

  const { data, error } = await supabase
    .from('sent_emails')
    .select('id, to_email, subject, message, sent_at')
    .order('sent_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch sent emails:', error);
    return NextResponse.json({ emails: [] });
  }

  return NextResponse.json({ emails: data ?? [] });
}
