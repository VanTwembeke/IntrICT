'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useChatContext, invalidateConversationsCache } from '@/contexts/ChatContext';
import type { Profile } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  profiles: { full_name: string | null; email: string };
  message_attachments: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
  }>;
}

interface Props {
  profile: Profile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'zojuist';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} u`;
  return new Date(iso).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
}

// ─── Message list (autoscroll) ────────────────────────────────────────────────

function MessageList({ messages, profileId }: { messages: Message[]; profileId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Geen berichten
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      {messages.map((msg) => {
        const isMine = msg.sender_id === profileId;
        return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%]">
              {!isMine && (
                <p className="text-[10px] text-slate-400 mb-0.5 ml-1">
                  {msg.profiles.full_name ?? msg.profiles.email}
                </p>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                <p>{msg.content}</p>
                {msg.message_attachments?.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {msg.message_attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                          isMine
                            ? 'bg-blue-500/40 hover:bg-blue-500/60 text-blue-100'
                            : 'bg-white hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Download size={10} />
                        <span className="truncate max-w-[120px]">{att.file_name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <p className={`text-[10px] text-slate-400 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Conversation view ────────────────────────────────────────────────────────

function ConversationView({
  conversationId,
  profile,
  subject,
  onBack,
}: {
  conversationId: string;
  profile: Profile;
  subject: string;
  onBack: () => void;
}) {
  const { markAsRead, refetchConversations } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/conversation/${conversationId}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(
        (data.messages ?? []).map((m: Message) => ({
          ...m,
          message_attachments: m.message_attachments ?? [],
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    markAsRead(conversationId);
  }, [conversationId, fetchMessages, markAsRead]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content && !attachment) return;

    // Optimistic
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      sender_id: profile.id,
      profiles: { full_name: profile.full_name, email: profile.email },
      message_attachments: [],
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    setAttachment(null);
    setSending(true);

    try {
      const form = new FormData();
      form.append('conversation_id', conversationId);
      form.append('content', content);
      if (attachment) form.append('files', attachment);

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (res.ok) {
        invalidateConversationsCache();
        await fetchMessages();
        refetchConversations();
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setText(content);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {subject || 'Gesprek'}
          </p>
        </div>
        <Link
          href={`/dashboard/messages`}
          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Open volledig"
        >
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MessageList messages={messages} profileId={profile.id} />
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-slate-100 bg-white shrink-0">
        {attachment && (
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1">
            <Paperclip size={10} />
            <span className="truncate flex-1">{attachment.name}</span>
            <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-500">
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0">
            <Paperclip size={15} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bericht typen…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24 overflow-y-auto"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !attachment)}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Conversation list ────────────────────────────────────────────────────────

function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const { conversations, conversationsLoading } = useChatContext();

  if (conversationsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-4">
        <MessageSquare size={28} className="text-slate-200" />
        <p className="text-sm text-slate-400">Geen gesprekken</p>
        <Link
          href="/dashboard/messages"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Start een gesprek →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="w-full flex items-start gap-3 px-3 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors text-left"
        >
          {/* Avatar initials */}
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {(conv.subject || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {conv.subject || 'Geen onderwerp'}
              </p>
              {conv.last_message && (
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatRelative(conv.last_message.created_at)}
                </span>
              )}
            </div>
            {conv.last_message && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {conv.last_message.sender?.full_name ?? conv.last_message.sender?.email}
                {': '}
                {conv.last_message.content}
              </p>
            )}
          </div>
          {conv.unread_count > 0 ? (
            <span className="mt-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-500 rounded-full shrink-0">
              {conv.unread_count > 9 ? '9+' : conv.unread_count}
            </span>
          ) : (
            <ChevronRight size={14} className="text-slate-300 mt-1.5 shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function ChatWidget({ profile }: Props) {
  const {
    isOpen,
    openChat,
    closeChat,
    activeConversationId,
    setActiveConversationId,
    unreadCount,
    conversations,
  } = useChatContext();

  // When widget opens without a specific conversation, clear active
  const handleOpen = () => {
    if (!isOpen) openChat();
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-40 w-13 h-13 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Chat openen"
            style={{ width: '52px', height: '52px' }}
          >
            <MessageSquare size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Widget panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
              onClick={closeChat}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
              style={{ height: '520px' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span className="text-sm font-semibold">Berichten</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href="/dashboard/messages"
                    onClick={closeChat}
                    className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                    title="Open in volledige weergave"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={closeChat}
                    className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                    aria-label="Sluit chat"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Panel body */}
              {activeConversationId && activeConversation ? (
                <ConversationView
                  conversationId={activeConversationId}
                  profile={profile}
                  subject={activeConversation.subject}
                  onBack={() => setActiveConversationId(null)}
                />
              ) : (
                <ConversationList
                  onSelect={(id) => setActiveConversationId(id)}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
