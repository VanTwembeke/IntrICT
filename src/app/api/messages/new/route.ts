import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 🔍 Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - no user session' },
      { status: 401 }
    );
  }

  const { recipientId, subject, message } = await req.json();

  if (!recipientId || !message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // ✅ Validate recipient
  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', recipientId)
    .single();

  if (recipientError || !recipient) {
    return NextResponse.json(
      { error: 'Recipient not found' },
      { status: 404 }
    );
  }

  let conversationId: string | null = null;

  /**
   * ✅ Find existing conversation between the two users
   */
  const { data: participantRows, error: participantFetchError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', user.id);

  if (participantFetchError) {
    console.error('Participant fetch error:', participantFetchError);
    return NextResponse.json(
      { error: participantFetchError.message },
      { status: 500 }
    );
  }

  const userConversationIds =
    participantRows?.map((p) => p.conversation_id) || [];

  if (userConversationIds.length > 0) {
    const { data: match, error: matchError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', recipientId)
      .in('conversation_id', userConversationIds);

    if (matchError) {
      console.error('Match error:', matchError);
      return NextResponse.json(
        { error: matchError.message },
        { status: 500 }
      );
    }

    conversationId = match?.[0]?.conversation_id ?? null;
  }

  /**
   * ✅ Create conversation if none exists
   */
  if (!conversationId) {
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject:
          subject ||
          `Conversation with ${recipient.full_name || recipient.email}`,
        created_by: user.id, // MUST match RLS policy
      })
      .select()
      .single();

    if (convError || !newConversation) {
      console.error('Failed to create conversation:', convError);
      return NextResponse.json(
        { error: convError?.message || 'Conversation insert failed' },
        { status: 500 }
      );
    }

    conversationId = newConversation.id;

    /**
     * ✅ Insert participants
     */
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversationId,
          profile_id: user.id,
        },
        {
          conversation_id: conversationId,
          profile_id: recipientId,
        },
      ]);

    if (participantsError) {
      console.error('Participants insert error:', participantsError);
      return NextResponse.json(
        { error: participantsError.message },
        { status: 500 }
      );
    }
  }

  // 🛑 Safety check
  if (!conversationId) {
    return NextResponse.json(
      { error: 'Failed to resolve conversation' },
      { status: 500 }
    );
  }

  /**
   * ✅ Insert message
   */
  const { data: messageRow, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: message,
    })
    .select()
    .single();

  if (msgError) {
    console.error('Message insert error:', msgError);
    return NextResponse.json(
      { error: msgError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversationId,
    message: messageRow,
  });
}