import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ emails: [] });

  const threadId = req.nextUrl.searchParams.get('thread_id');
  if (!threadId) return NextResponse.json({ emails: [] });

  const { data, error } = await supabase
    .from('inbound_emails')
    .select('*')
    .eq('thread_id', threadId)
    .order('received_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch thread:', error);
    return NextResponse.json({ emails: [] });
  }

  return NextResponse.json({ emails: data ?? [] });
}
