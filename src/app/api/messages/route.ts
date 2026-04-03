import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ conversations: [] });
  }

  // Get all conversations where the user is a participant
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      subject,
      created_at,
      updated_at,
      created_by,
      conversation_participants!inner(profile_id),
      messages!inner(
        id,
        content,
        created_at,
        read_at,
        sender_id,
        profiles!messages_sender_id_fkey(full_name, email)
      )
    `)
    .eq('conversation_participants.profile_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ conversations: [] });
  }

  // Process the data to get the last message and unread count for each conversation
  const processedConversations = conversations?.map(conv => {
    const messages = conv.messages || [];
    const lastMessage = messages.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const unreadCount = messages.filter(msg =>
      msg.sender_id !== user.id && !msg.read_at
    ).length;

    return {
      id: conv.id,
      subject: conv.subject,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      created_by: conv.created_by,
      last_message: lastMessage ? {
        content: lastMessage.content,
        created_at: lastMessage.created_at,
        sender: lastMessage.profiles
      } : null,
      unread_count: unreadCount
    };
  }) || [];

  return NextResponse.json({ conversations: processedConversations });
}