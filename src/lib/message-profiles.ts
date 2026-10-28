import type { SupabaseClient } from '@supabase/supabase-js';

export interface PeerProfile { id: string; full_name: string | null; email: string }
interface MessageIdentity { sender_id: string; parent_message?: { sender_id: string } | { sender_id: string }[] | null }
const formerPeer = { full_name: 'Voormalige deelnemer', email: '' };

export async function getConversationPeers(supabase: SupabaseClient, conversationId: string): Promise<PeerProfile[]> {
  const { data, error } = await supabase.rpc('conversation_peers', { conversation_uuid: conversationId });
  if (error || !Array.isArray(data)) throw new Error('Deelnemers konden niet worden geladen.');
  return data as PeerProfile[];
}

// No base-profile embeds: those deliberately obey private owner/admin RLS.
// Always resolve identities within this exact conversation, not a global directory.
export async function hydrateMessageProfiles<T extends MessageIdentity>(supabase: SupabaseClient, conversationId: string, messages: T[]) {
  const peers = await getConversationPeers(supabase, conversationId);
  const byId = new Map(peers.map(peer => [peer.id, { full_name: peer.full_name, email: peer.email }]));
  return messages.map(message => {
    const parent = Array.isArray(message.parent_message) ? message.parent_message[0] : message.parent_message;
    return {
      ...message,
      profiles: byId.get(message.sender_id) ?? formerPeer,
      parent_message: parent ? { ...parent, profiles: byId.get(parent.sender_id) ?? formerPeer } : null,
    };
  });
}
