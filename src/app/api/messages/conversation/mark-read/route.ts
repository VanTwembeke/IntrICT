import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const conversationId = body?.conversationId;
    if (typeof conversationId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', conversationId)
      .eq('profile_id', user.id)
      .maybeSingle();
    if (participantError) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    if (!participant) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const { error } = await supabase.rpc('mark_messages_read', {
      conversation_uuid: conversationId,
      user_uuid: user.id,
    });
    if (error) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
