'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/messages');
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

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh conversations when messages change
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
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
    } catch (error) {
      console.error('Failed to mark as read:', error);
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