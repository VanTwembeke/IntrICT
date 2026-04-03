import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipientId, subject, message } = await req.json();

  if (!recipientId || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if recipient exists
  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', recipientId)
    .single();

  if (recipientError || !recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }

  // Check if a conversation already exists between these users
  const { data: existingParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', recipientId);

  const existingConversationIds = existingParticipants?.map(p => p.conversation_id) || [];

  const { data: existingConversation, error: convCheckError } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      conversations!inner(id, subject)
    `)
    .eq('profile_id', user.id)
    .in('conversation_id', existingConversationIds);

  if (convCheckError) {
    console.error('Error checking existing conversations:', convCheckError);
  }

  let conversationId: string;

  if (existingConversation && existingConversation.length > 0) {
    // Use existing conversation
    conversationId = existingConversation[0].conversation_id;
  } else {
    // Create new conversation
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject: subject || `Conversation with ${recipient.full_name || recipient.email}`,
        created_by: user.id
      })
      .select()
      .single();

    if (convError) {
      console.error('Failed to create conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    conversationId = newConversation.id;

    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversationId, profile_id: user.id },
        { conversation_id: conversationId, profile_id: recipientId }
      ]);

    if (participantsError) {
      console.error('Failed to add participants:', participantsError);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }
  }

  // Send the initial message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: message
    });

  if (msgError) {
    console.error('Failed to send message:', msgError);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({
    conversationId,
    message: 'Conversation created and message sent successfully'
  });
}