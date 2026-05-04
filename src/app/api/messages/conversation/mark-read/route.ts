import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await request.json();
  if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

  await supabase.rpc('mark_messages_read', {
    conversation_uuid: conversationId,
    user_uuid: user.id,
  });

  return NextResponse.json({ success: true });
}
