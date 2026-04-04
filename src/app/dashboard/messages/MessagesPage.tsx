'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  User,
  Plus,
  Reply,
  Download,
  ChevronLeft,
} from 'lucide-react';
import type { Profile } from '@/lib/types';

interface Conversation {
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

interface Message {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  parent_message_id: string | null;
  sender_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
  message_attachments: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
  }>;
  parent_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    profiles: {
      full_name: string | null;
      email: string;
    };
  } | null;
}

interface ConversationDetail {
  id: string;
  subject: string;
  created_at: string;
  created_by: string;
  conversation_participants: Array<{
    profile_id: string;
    profiles: {
      full_name: string | null;
      email: string;
    };
  }>;
}

interface Props {
  profile: Profile;
  allProfiles: Array<{
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    company: string | null;
  }>;
  initialConversations?: Array<{
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
  }>;
}

export default memo(function MessagesPage({ profile, allProfiles, initialConversations = [] }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [newConversationFiles, setNewConversationFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(initialConversations.length === 0);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const isAdmin = profile.role === 'admin';

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

  const fetchConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversation/${conversationId}`);
      const data = await response.json();
      setConversationDetail(data.conversation);
      // Ensure message_attachments is always an array
      const messagesWithAttachments = (data.messages || []).map((msg: Message) => ({
        ...msg,
        message_attachments: msg.message_attachments || [],
        parent_message: msg.parent_message || null
      }));
      setMessages(messagesWithAttachments);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  }, []);

  useEffect(() => {
    if (initialConversations.length === 0) {
      fetchConversations();
    }
  }, [initialConversations.length, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversation(selectedConversation);
    }
  }, [selectedConversation, fetchConversation]);

  const sendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && attachments.length === 0)) return;

    const messageContent = newMessage.trim();
    const messageAttachments = [...attachments];

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      created_at: new Date().toISOString(),
      read_at: null,
      parent_message_id: replyingTo?.id || null,
      sender_id: profile.id,
      profiles: {
        full_name: profile.full_name,
        email: profile.email,
      },
      message_attachments: messageAttachments.map((file, index) => ({
        id: `temp-attachment-${Date.now()}-${index}`,
        file_name: file.name,
        file_url: '#',
        file_size: file.size,
        mime_type: file.type,
      })),
    };

    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setAttachments([]);
    setReplyingTo(null);
    setSending(true);

    try {
      const formData = new FormData();
      formData.append('conversation_id', selectedConversation);
      formData.append('content', messageContent);
      if (replyingTo) {
        formData.append('parent_message_id', replyingTo.id);
      }
      messageAttachments.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh data in background
        await fetchConversation(selectedConversation);
        await fetchConversations();
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        setNewMessage(messageContent);
        setAttachments(messageAttachments);
        if (replyingTo) setReplyingTo(replyingTo);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(messageContent);
      setAttachments(messageAttachments);
      if (replyingTo) setReplyingTo(replyingTo);
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async () => {
    if (!newRecipient || !newConversationMessage.trim()) return;

    try {
      const response = await fetch('/api/messages/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: newRecipient,
          subject: newSubject,
          message: newConversationMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Send files as a follow-up message if any were attached
        if (newConversationFiles.length > 0) {
          const formData = new FormData();
          formData.append('conversation_id', data.conversationId);
          formData.append('content', '📎 Bijlage(n)');
          newConversationFiles.forEach((file) => formData.append('files', file));
          await fetch('/api/messages/send', { method: 'POST', body: formData });
        }

        setShowNewConversation(false);
        setNewRecipient('');
        setNewSubject('');
        setNewConversationMessage('');
        setNewConversationFiles([]);
        setSelectedConversation(data.conversationId);
        await fetchConversations();
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const getOtherParticipants = (
    participants: ConversationDetail['conversation_participants']
  ) => {
    return participants.filter((p) => p.profile_id !== profile.id);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Group profiles for the dropdown
  const adminProfiles = allProfiles.filter((p) => p.role === 'admin');
  const otherProfiles = allProfiles.filter((p) => p.role !== 'admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 text-6xl">💬</div>
          <h3 className="mb-2 text-xl font-semibold text-slate-800">Berichten Laden...</h3>
          <p className="text-slate-500">Even geduld terwijl we je berichten ophalen</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+")`,
            }}
          />
        </div>
        <div className="absolute rounded-full pointer-events-none -right-24 -top-24 h-80 w-80 bg-blue-600/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-16 left-1/4 bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 transition-colors text-slate-300 hover:text-white"
            >
              <ChevronLeft size={20} />
              <span>Terug naar Dashboard</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Jouw{' '}
              <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                Berichten
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
              Communiceer eenvoudig met andere gebruikers. Start nieuwe gesprekken,
              deel bestanden en blijf verbonden met je netwerk.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
              {[
                { label: 'Actieve Gesprekken', value: conversations.length.toString() },
                { label: 'Ongelezen Berichten', value: totalUnread.toString() },
                { label: 'Nieuwe Berichten', value: '24/7' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Messages Interface ──────────────────────────────────────────── */}
      <section className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden bg-white shadow-xl rounded-2xl"
          >
            <div className="flex" style={{ minHeight: '600px' }}>

              {/* ── Sidebar ─────────────────────────────────────────────── */}
              <div className="flex flex-col border-r w-80 border-slate-200 bg-slate-50">
                <div className="p-6 bg-white border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Gesprekken</h2>
                    <motion.button
                      onClick={() => setShowNewConversation(!showNewConversation)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 transition-all duration-200 rounded-xl shadow-lg ${
                        showNewConversation
                          ? 'bg-slate-200 text-slate-600'
                          : 'text-white bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      }`}
                      title={showNewConversation ? 'Annuleren' : 'Nieuw gesprek'}
                    >
                      {showNewConversation ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                {/* new conversation form */}
                {showNewConversation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border-b border-slate-200"
                  >
                    <div className="p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">Nieuw Gesprek</h3>

                      {/* Recipient */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Ontvanger
                        </label>
                        <select
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          className="w-full p-3 transition-all duration-200 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                        >
                          <option value="">Selecteer ontvanger</option>

                          {isAdmin ? (
                            // Admins: grouped list — admins first, then everyone else
                            <>
                              {adminProfiles.length > 0 && (
                                <optgroup label="Admins">
                                  {adminProfiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.full_name || p.email}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {otherProfiles.length > 0 && (
                                <optgroup label="Gebruikers">
                                  {otherProfiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.full_name || p.email}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </>
                          ) : (
                            // Regular users: admins + same-company users (already filtered server-side)
                            <>
                              {adminProfiles.length > 0 && (
                                <optgroup label="Admins">
                                  {adminProfiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.full_name || p.email}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                              {otherProfiles.length > 0 && (
                                <optgroup label="Collega's">
                                  {otherProfiles.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.full_name || p.email}
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </>
                          )}
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Onderwerp{' '}
                          <span className="font-normal text-slate-400">(optioneel)</span>
                        </label>
                        <input
                          type="text"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Gespreksonderwerp"
                          className="w-full p-3 transition-all duration-200 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Bericht <span className="text-blue-500">*</span>
                        </label>
                        <textarea
                          value={newConversationMessage}
                          onChange={(e) => setNewConversationMessage(e.target.value)}
                          placeholder="Typ je eerste bericht..."
                          className="w-full p-3 transition-all duration-200 border resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          rows={3}
                        />
                      </div>

                      {/* File attachments for new conversation */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Bijlagen{' '}
                          <span className="font-normal text-slate-400">(optioneel)</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setNewConversationFiles(Array.from(e.target.files || []))
                            }
                            className="hidden"
                            id="new-conv-file-upload"
                          />
                          <label
                            htmlFor="new-conv-file-upload"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border cursor-pointer text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300"
                          >
                            <Paperclip className="w-4 h-4" />
                            Bestand toevoegen
                          </label>
                          {newConversationFiles.length > 0 && (
                            <span className="text-xs text-blue-600">
                              {newConversationFiles.length} bestand(en) geselecteerd
                            </span>
                          )}
                        </div>

                        {/* File preview */}
                        {newConversationFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newConversationFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100"
                              >
                                <Paperclip className="w-3 h-3 text-slate-500" />
                                <span className="text-xs truncate text-slate-700 max-w-24">
                                  {file.name}
                                </span>
                                <button
                                  onClick={() =>
                                    setNewConversationFiles(
                                      newConversationFiles.filter((_, i) => i !== index)
                                    )
                                  }
                                  className="transition-colors text-slate-400 hover:text-slate-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => {
                            setShowNewConversation(false);
                            setNewRecipient('');
                            setNewSubject('');
                            setNewConversationMessage('');
                            setNewConversationFiles([]);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2 font-semibold transition-all duration-200 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                        >
                          Annuleren
                        </motion.button>
                        <motion.button
                          onClick={startNewConversation}
                          disabled={!newRecipient || !newConversationMessage.trim()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-4 py-2 font-semibold text-white transition-all duration-200 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Start Gesprek
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* conversation list */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="mb-2 text-slate-500">Geen gesprekken gevonden</p>
                      <p className="text-sm text-slate-400">
                        Start een nieuw gesprek om te beginnen
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <motion.button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        whileHover={{ backgroundColor: 'rgba(59,130,246,0.05)' }}
                        className={`w-full p-4 text-left border-b border-slate-100 transition-colors ${
                          selectedConversation === conversation.id
                            ? 'bg-blue-50 border-r-4 border-r-blue-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="mb-1 text-sm font-semibold truncate text-slate-800">
                              {conversation.subject || 'Geen onderwerp'}
                            </p>
                            {conversation.last_message && conversation.last_message.sender && (
                              <p className="mb-2 text-sm truncate text-slate-500">
                                {conversation.last_message.sender.full_name ||
                                  conversation.last_message.sender.email}
                                : {conversation.last_message.content}
                              </p>
                            )}
                            <p className="text-xs text-slate-400">
                              {new Date(conversation.updated_at).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full shadow-sm">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* ── Main Message Area ────────────────────────────────────── */}
              <div className="flex flex-col flex-1">
                {selectedConversation && conversationDetail ? (
                  <>
                    {/* conversation header */}
                    <div className="p-6 bg-white border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">
                            {conversationDetail.subject || 'Gesprek'}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Met{' '}
                            {getOtherParticipants(conversationDetail.conversation_participants)
                              .map((p) => p.profiles.full_name || p.profiles.email)
                              .join(', ')}
                          </p>
                        </div>
                        <div className="text-xs text-slate-400">
                          Gestart op{' '}
                          {new Date(conversationDetail.created_at).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    </div>

                    {/* message list */}
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.sender_id === profile.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className="max-w-md lg:max-w-lg">
                            <div
                              className={`p-4 rounded-2xl shadow-sm ${
                                message.sender_id === profile.id
                                  ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white'
                                  : 'bg-white border border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <User
                                  className={`h-4 w-4 ${
                                    message.sender_id === profile.id
                                      ? 'text-blue-200'
                                      : 'text-slate-400'
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    message.sender_id === profile.id
                                      ? 'text-blue-100'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {message.profiles.full_name || message.profiles.email}
                                </span>
                                <span
                                  className={`text-xs ${
                                    message.sender_id === profile.id
                                      ? 'text-blue-200'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleTimeString('nl-NL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              
                              {/* quoted/parent message */}
                              {message.parent_message && (
                                <div
                                  className={`mb-2 p-2 border-l-4 rounded text-xs ${
                                    message.sender_id === profile.id
                                      ? 'bg-blue-600/30 border-blue-300 text-blue-50'
                                      : 'bg-slate-100 border-slate-400 text-slate-700'
                                  }`}
                                >
                                  <p className="mb-1 font-medium">
                                    {message.parent_message.profiles.full_name || message.parent_message.profiles.email}:
                                  </p>
                                  <p className="opacity-90 line-clamp-2">{message.parent_message.content}</p>
                                </div>
                              )}
                              
                              <p className="text-sm leading-relaxed">{message.content}</p>

                              {/* attachments */}
                              {message.message_attachments?.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.message_attachments.map((att) => (
                                      <a
                                      key={att.id}
                                      href={att.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                        message.sender_id === profile.id
                                          ? 'bg-blue-600/50 hover:bg-blue-600/70 text-blue-100'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <Download className="w-4 h-4" />
                                      <span className="truncate max-w-32">{att.file_name}</span>
                                      <span className="text-xs opacity-75">
                                        ({(att.file_size / 1024).toFixed(1)} KB)
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setReplyingTo(message)}
                              className="flex items-center gap-1 mt-1 text-xs transition-colors text-slate-400 hover:text-slate-600"
                            >
                              <Reply className="w-3 h-3" />
                              Reageer
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* reply indicator */}
                    {replyingTo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-3 border-t border-blue-200 bg-blue-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Reply className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700">
                              Reageren op{' '}
                              {replyingTo.profiles.full_name || replyingTo.profiles.email}:
                            </span>
                            <span className="max-w-xs text-sm text-blue-600 truncate">
                              &quot;{replyingTo.content}&quot;
                            </span>
                          </div>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-blue-400 transition-colors hover:text-blue-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* message input */}
                    <div className="p-6 bg-white border-t border-slate-200">
                      <div className="flex gap-3">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Typ je bericht..."
                          className="flex-1 p-4 transition-all duration-200 border resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setAttachments(Array.from(e.target.files || []))
                            }
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="p-3 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                            title="Bijlage toevoegen"
                          >
                            <Paperclip className="w-5 h-5" />
                          </label>
                          <motion.button
                            onClick={sendMessage}
                            disabled={
                              sending || (!newMessage.trim() && attachments.length === 0)
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 text-white transition-all duration-200 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* attachment preview */}
                      {attachments.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-wrap gap-2 mt-4"
                        >
                          {attachments.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100"
                            >
                              <Paperclip className="w-4 h-4 text-slate-500" />
                              <span className="text-sm truncate text-slate-700 max-w-32">
                                {file.name}
                              </span>
                              <button
                                onClick={() =>
                                  setAttachments(attachments.filter((_, i) => i !== index))
                                }
                                className="transition-colors text-slate-500 hover:text-slate-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center flex-1">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-md text-center"
                    >
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-800">
                        Selecteer een gesprek
                      </h3>
                      <p className="text-slate-500">
                        Kies een gesprek uit de zijbalk om berichten te bekijken, of start
                        een nieuw gesprek via de{' '}
                        <button
                          onClick={() => setShowNewConversation(true)}
                          className="font-semibold text-blue-500 underline underline-offset-2 hover:text-blue-700"
                        >
                          + knop
                        </button>
                        .
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
});