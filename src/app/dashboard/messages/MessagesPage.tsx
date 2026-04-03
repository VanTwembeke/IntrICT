'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  User,
  Plus,
  ArrowLeft,
  Reply,
  Download
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
    };
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
  }>;
}

export default function MessagesPage({ profile, allProfiles }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation messages
  const fetchConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversation/${conversationId}`);
      const data = await response.json();
      setConversationDetail(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversation(selectedConversation);
    }
  }, [selectedConversation]);

  // Send message
  const sendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && attachments.length === 0)) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', selectedConversation);
      formData.append('content', newMessage);
      if (replyingTo) {
        formData.append('parent_message_id', replyingTo.id);
      }
      attachments.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewMessage('');
        setAttachments([]);
        setReplyingTo(null);
        await fetchConversation(selectedConversation);
        await fetchConversations(); // Refresh conversation list
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Start new conversation
  const startNewConversation = async () => {
    if (!newRecipient || !newConversationMessage.trim()) return;

    try {
      const response = await fetch('/api/messages/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: newRecipient,
          subject: newSubject,
          message: newConversationMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewConversation(false);
        setNewRecipient('');
        setNewSubject('');
        setNewConversationMessage('');
        setSelectedConversation(data.conversationId);
        await fetchConversations();
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOtherParticipants = (participants: ConversationDetail['conversation_participants']) => {
    return participants.filter(p => p.profile_id !== profile.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading messages...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm min-h-150 flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new conversation to get started</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.subject}
                        </p>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {conversation.last_message.sender.full_name || conversation.last_message.sender.email}: {conversation.last_message.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation && conversationDetail ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {conversationDetail.subject}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getOtherParticipants(conversationDetail.conversation_participants)
                          .map(p => p.profiles.full_name || p.profiles.email)
                          .join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 md:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.profiles.full_name || message.profiles.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            <Reply className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>

                        {/* Attachments */}
                        {message.message_attachments && message.message_attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.message_attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-gray-100"
                              >
                                <Paperclip className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{attachment.file_name}</span>
                                <span className="text-xs text-gray-500">({formatFileSize(attachment.file_size)})</span>
                                <Download className="h-4 w-4 text-gray-400" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Indicator */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Reply className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-700">
                          Replying to {replyingTo.profiles.full_name || replyingTo.profiles.email}
                        </span>
                        <span className="text-sm text-blue-600 truncate max-w-md">
                          &ldquo;{replyingTo.content}&rdquo;
                        </span>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <Paperclip className="h-5 w-5" />
                      </label>
                      <button
                        onClick={sendMessage}
                        disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Attachment Preview */}
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          <Paperclip className="h-3 w-3" />
                          <span className="text-xs">{file.name}</span>
                          <button
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                  <p className="mt-1 text-sm text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Conversation</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                  <select
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select recipient</option>
                    {allProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Conversation subject"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={newConversationMessage}
                    onChange={(e) => setNewConversationMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewConversation}
                  disabled={!newRecipient || !newConversationMessage.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Conversation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}