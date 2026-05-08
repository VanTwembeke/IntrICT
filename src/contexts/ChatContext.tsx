'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  subject: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_message: {
    content: string;
    created_at: string;
    sender: { full_name: string | null; email: string } | null;
  } | null;
  unread_count: number;
}

interface ChatContextType {
  // Conversations data (single source of truth)
  conversations: Conversation[];
  conversationsLoading: boolean;
  unreadCount: number;
  refetchConversations: () => void;
  markAsRead: (conversationId: string) => void;

  // Widget state
  isOpen: boolean;
  openChat: (conversationId?: string) => void;
  closeChat: () => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

// ─── Module-level cache (survives re-renders, resets on page navigation) ────

interface CacheEntry {
  data: Conversation[];
  timestamp: number;
}

let _cache: CacheEntry | null = null;
const CACHE_TTL_MS = 30_000; // 30s stale-while-revalidate

function getCached(): Conversation[] | null {
  if (!_cache) return null;
  if (Date.now() - _cache.timestamp > CACHE_TTL_MS) return null;
  return _cache.data;
}

function setCache(data: Conversation[]) {
  _cache = { data, timestamp: Date.now() };
}

export function invalidateConversationsCache() {
  _cache = null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextType>({
  conversations: [],
  conversationsLoading: true,
  unreadCount: 0,
  refetchConversations: () => {},
  markAsRead: () => {},
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  activeConversationId: null,
  setActiveConversationId: () => {},
});

export const useChatContext = () => useContext(ChatContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(
    () => getCached() ?? []
  );
  const [conversationsLoading, setConversationsLoading] = useState(
    () => getCached() === null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Debounce ref for realtime events
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchConversations = useCallback(async (force = false) => {
    // Serve from cache if fresh enough (unless forced)
    if (!force) {
      const cached = getCached();
      if (cached) {
        setConversations(cached);
        setConversationsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/messages', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const list: Conversation[] = data.conversations ?? [];
      setCache(list);
      setConversations(list);
    } catch (err) {
      console.error('[ChatContext] fetchConversations failed:', err);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription with debounce
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('chat-context-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          // Debounce: coalesce rapid successive events into one refetch
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            invalidateConversationsCache();
            fetchConversations(true);
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const markAsRead = useCallback(
    async (conversationId: string) => {
      // Optimistic update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
      // Update cache too
      if (_cache) {
        _cache.data = _cache.data.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        );
      }
      try {
        await fetch('/api/messages/conversation/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId }),
        });
      } catch {
        // Revert on error
        invalidateConversationsCache();
        fetchConversations(true);
      }
    },
    [fetchConversations]
  );

  const openChat = useCallback((conversationId?: string) => {
    if (conversationId) setActiveConversationId(conversationId);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        conversationsLoading,
        unreadCount,
        refetchConversations: () => fetchConversations(true),
        markAsRead,
        isOpen,
        openChat,
        closeChat,
        activeConversationId,
        setActiveConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
