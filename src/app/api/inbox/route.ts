import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ emails: [] });

  // Only return thread roots (thread_id IS NULL = top-level inbound emails)
  const { data, error } = await supabase
    .from('inbound_emails')
    .select('*')
    .is('thread_id', null)
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch inbound emails:', error);
    return NextResponse.json({ emails: [] });
  }

  return NextResponse.json({ emails: data ?? [] });
}
