// app/(dashboard)/messages/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hydrateMessageProfiles } from '@/lib/message-profiles';
import type { Profile } from '@/lib/types';
import MessagesPage from './MessagesPage';

export default async function MessagesServerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/login');

  const { data: recipients, error: recipientError } = await supabase.rpc('message_recipients');
  if (recipientError) throw new Error('Ontvangers konden niet worden geladen.');
  const allProfiles: Array<{ id: string; full_name: string | null; email: string; role: string; company: string | null }> = recipients ?? [];

  // Preload conversations on server side for faster initial load
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      subject,
      created_at,
      updated_at,
      created_by,
      conversation_participants!inner(profile_id),
      messages(
        id,
        content,
        created_at,
        read_at,
        sender_id
      )
    `)
    .eq('conversation_participants.profile_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20); // Limit initial load to 20 most recent conversations

  let processedConversations: Array<{
    id: string;
    subject: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    last_message: {
      content: string;
      created_at: string;
      sender: {
        full_name: string | null;
        email: string;
      } | null;
    } | null;
    unread_count: number;
  }> = [];

  if (error) throw new Error('Gesprekken konden niet worden geladen.');
  if (conversations) {
    processedConversations = await Promise.all(conversations.map(async conv => {
      const messages = await hydrateMessageProfiles(supabase, conv.id, conv.messages || []);
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
    }));
  }

  return (
    <MessagesPage
      profile={profile}
      allProfiles={allProfiles}
      initialConversations={processedConversations}
    />
  );
}