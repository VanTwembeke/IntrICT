import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const conversationId = formData.get('conversation_id') as string;
  const content = formData.get('content') as string;
  const parentMessageId = formData.get('parent_message_id') as string | null;
  const files = formData.getAll('files') as File[];

  if (!conversationId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if user is a participant in this conversation
  const { data: participant, error: participantError } = await supabase
    .from('conversation_participants')
    .select('profile_id')
    .eq('conversation_id', conversationId)
    .eq('profile_id', user.id)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ error: 'Not authorized to send messages in this conversation' }, { status: 403 });
  }

  // Create the message
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      parent_message_id: parentMessageId || null
    })
    .select()
    .single();

  if (msgError) {
    console.error('Failed to create message:', msgError);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  // Handle file attachments
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.size > 0) {
        const fileName = file.name;
        const fileSize = file.size;
        const mimeType = file.type;

        // Upload file to Supabase storage
        const { data: upload, error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(`${message.id}/${fileName}`, file, { contentType: mimeType });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue; // Continue with other files
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(upload.path);

        // Save attachment record
        await supabase
          .from('message_attachments')
          .insert({
            message_id: message.id,
            file_name: fileName,
            file_url: publicUrl,
            file_size: fileSize,
            mime_type: mimeType
          });
      }
    }
  }

  return NextResponse.json({ message: 'Message sent successfully', messageId: message.id });
}