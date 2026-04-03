import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;

  // Check if user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from('conversation_participants')
    .select('profile_id')
    .eq('conversation_id', conversationId)
    .eq('profile_id', user.id)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Get conversation details
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      subject,
      created_at,
      created_by,
      conversation_participants(
        profile_id,
        profiles(full_name, email)
      )
    `)
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Get messages with attachments
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read_at,
      parent_message_id,
      sender_id,
      profiles!messages_sender_id_fkey(full_name, email),
      message_attachments(
        id,
        file_name,
        file_url,
        file_size,
        mime_type
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('Failed to fetch messages:', msgError);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  // Mark messages as read
  await supabase.rpc('mark_messages_read', {
    conversation_uuid: conversationId,
    user_uuid: user.id
  });

  return NextResponse.json({
    conversation,
    messages: messages || []
  });
}