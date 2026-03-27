import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// In-memory store for received emails (replace with DB table later for persistence)
// Emails are stored via the inbound webhook at /api/inbound
export const emailStore: Array<{
  id: string;
  from: string;
  subject: string;
  html: string;
  received_at: string;
}> = [];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ emails: emailStore });
}
