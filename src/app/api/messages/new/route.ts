import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 🔍 DEBUG: verify auth context
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  console.log('USER:', user);
  console.log('SESSION:', session);

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

  // ✅ Check if recipient exists
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

  // ✅ Initialize properly (FIXES TS ERROR)
  let conversationId: string | null = null;

  // ✅ Try to find existing conversation
  const { data: existingParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', recipientId);

  const existingConversationIds =
    existingParticipants?.map((p) => p.conversation_id) || [];

  if (existingConversationIds.length > 0) {
    const { data: existingConversation } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('profile_id', user.id)
      .in('conversation_id', existingConversationIds);

    conversationId =
      existingConversation?.[0]?.conversation_id ?? null;
  }

  // ✅ Create new conversation if none exists
  if (!conversationId) {
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        subject:
          subject ||
          `Conversation with ${recipient.full_name || recipient.email}`,
        created_by: user.id, // 🔥 must match auth.uid()
      })
      .select()
      .single();

    if (convError || !newConversation) {
      console.error('Failed to create conversation:', convError);
      return NextResponse.json(
        { error: convError?.message || 'Insert failed' },
        { status: 500 }
      );
    }

    conversationId = newConversation.id;

    // ✅ Insert participants (RLS-safe)
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversationId, profile_id: user.id },
        { conversation_id: conversationId, profile_id: recipientId },
      ]);

    if (participantsError) {
      console.error('Participants error:', participantsError);
      return NextResponse.json(
        { error: participantsError.message },
        { status: 500 }
      );
    }
  }

  // 🛑 Extra safety (should never happen now)
  if (!conversationId) {
    return NextResponse.json(
      { error: 'Failed to resolve conversation' },
      { status: 500 }
    );
  }

  // ✅ Send message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: message,
    });

  if (msgError) {
    console.error('Message error:', msgError);
    return NextResponse.json(
      { error: msgError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversationId,
    message: 'Conversation created and message sent successfully',
  });
}