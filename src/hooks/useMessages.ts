'use client';

/**
 * useMessages — standalone hook gebruikt door MessagesPage (volledige berichtenpagina).
 * Sidebar en ChatWidget gebruiken ChatContext ipv deze hook (gedeelde state, 1 fetch instantie).
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Conversation {
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
}

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages', { cache: 'no-store' });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription with debounce — prevents N refetches on burst events
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('messages-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            fetchConversations();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const markAsRead = useCallback(async (conversationId: string) => {
    // Optimistic update
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
    );
    try {
      await fetch('/api/messages/conversation/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
    } catch {
      fetchConversations(); // herstel bij fout
    }
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    unreadCount: totalUnreadCount,
    refetch: fetchConversations,
    markAsRead,
  };
}
