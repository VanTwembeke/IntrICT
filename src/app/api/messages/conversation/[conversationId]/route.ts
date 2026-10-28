import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConversationPeers, hydrateMessageProfiles } from '@/lib/message-profiles';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    // Check if user is a participant in this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('profile_id')
      .eq('conversation_id', conversationId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (participantError) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    if (!participant) {
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
          profile_id
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages with attachments and parent message info
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        read_at,
        parent_message_id,
        sender_id,
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

    const parentIds = [...new Set((messages || []).map(message => message.parent_message_id).filter(Boolean))];
    const parents = parentIds.length ? await supabase.from('messages')
      .select('id, content, sender_id, created_at')
      .eq('conversation_id', conversationId).in('id', parentIds) : { data: [], error: null };
    if (parents.error) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    const parentById = new Map((parents.data || []).map(parent => [parent.id, parent]));
    const peers = await getConversationPeers(supabase, conversationId);
    const hydratedMessages = await hydrateMessageProfiles(supabase, conversationId, (messages || []).map(message => ({
      ...message, parent_message: parentById.get(message.parent_message_id) ?? null,
    })));
    const byId = new Map(peers.map(peer => [peer.id, peer]));
    const participants = conversation.conversation_participants.map(participant => ({
      ...participant,
      profiles: byId.get(participant.profile_id) ?? { full_name: 'Voormalige deelnemer', email: '' },
    }));

    // Mark messages as read
    const { error: readError } = await supabase.rpc('mark_messages_read', {
      conversation_uuid: conversationId,
      user_uuid: user.id
    });

    if (readError) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

    return NextResponse.json({
      conversation: { ...conversation, conversation_participants: participants },
      messages: hydratedMessages
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
