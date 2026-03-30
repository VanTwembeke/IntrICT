import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ emails: [] });

  const { data } = await supabase
    .from('sent_emails')
    .select('*')
    .order('sent_at', { ascending: true });

  return NextResponse.json({ emails: data ?? [] });
}
