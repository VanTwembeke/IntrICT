import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { recipientId, subject, message } = await req.json();
  console.log('1. Received:', { recipientId, subject, message });

  if (!recipientId || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: recipient, error: recipientError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', recipientId)
    .single();

  console.log('2. Recipient:', recipient, 'Error:', recipientError);

  if (recipientError || !recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }

  const { data: existingParticipants, error: epError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', recipientId);

  console.log('3. Existing participants:', existingParticipants, 'Error:', epError);

  const existingConversationIds = existingParticipants?.map(p => p.conversation_id) || [];
  console.log('4. Existing conversation IDs:', existingConversationIds);

  const { data: newConversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      subject: subject || `Conversation with ${recipient.full_name || recipient.email}`,
      created_by: user.id
    })
    .select()
    .single();

  console.log('5. New conversation:', newConversation, 'Error:', convError);

  if (convError) {
    return NextResponse.json({ error: 'Failed to create conversation', detail: convError }, { status: 500 });
  }

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, profile_id: user.id },
      { conversation_id: newConversation.id, profile_id: recipientId }
    ]);

  console.log('6. Participants error:', participantsError);

  if (participantsError) {
    return NextResponse.json({ error: 'Failed to add participants', detail: participantsError }, { status: 500 });
  }

  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: newConversation.id,
      sender_id: user.id,
      content: message
    });

  console.log('7. Message error:', msgError);

  if (msgError) {
    return NextResponse.json({ error: 'Failed to send message', detail: msgError }, { status: 500 });
  }

  return NextResponse.json({ conversationId: newConversation.id });
}