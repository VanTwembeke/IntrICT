'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Paperclip, Inbox, Send, X, Reply,
  CheckCircle2, AlertCircle, Sparkles, ChevronRight,
} from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  body: string;
  file_name: string | null;
  file_url: string | null;
  read: boolean;
  created_at: string;
}

export default function BerichtenPage() {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [selected, setSelected]       = useState<Message | null>(null);
  const [loading, setLoading]         = useState(true);

  const [replyOpen, setReplyOpen]     = useState(false);
  const [replyText, setReplyText]     = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent]     = useState(false);
  const [replyError, setReplyError]   = useState(false);

  useEffect(() => {
    fetch('/api/inbox/messages')
      .then((r) => r.json())
      .then((data) => { setMessages(data.messages ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = async (msg: Message) => {
    setSelected(msg);
    setReplyOpen(false);
    setReplyText('');
    setReplySent(false);
    setReplyError(false);

    if (!msg.read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
      await fetch('/api/inbox/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id }),
      });
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplySending(true);
    setReplyError(false);
    try {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@intrict.com',
          subject: `Re: ${selected.subject}`,
          message: replyText,
        }),
      });
      if (res.ok) {
        setReplySent(true);
        setReplyText('');
        setTimeout(() => { setReplySent(false); setReplyOpen(false); }, 2500);
      } else {
        setReplyError(true);
      }
    } catch {
      setReplyError(true);
    } finally {
      setReplySending(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="w-full">

      {/* ── Hero header — identical structure to admin InboxPage ─────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+")`,
            }}
          />
        </div>
        <div className="absolute rounded-full pointer-events-none -right-24 -top-24 h-80 w-80 bg-violet-600/20 blur-3xl" />
        <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-16 left-1/4 bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 px-4 pt-10 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center shadow-lg h-14 w-14 rounded-2xl bg-linear-to-br from-violet-500 to-blue-500 shadow-violet-900/40 shrink-0">
                  <Inbox size={24} className="text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-400 text-[10px] font-bold text-white shadow">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={13} className="text-violet-400" />
                    <span className="text-xs font-semibold tracking-widest uppercase text-violet-400">
                      IntrICT Dashboard
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Berichten</h1>
                  <p className="mt-1 text-slate-400">Berichten van IntrICT</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <section className="py-10 bg-linear-to-br from-slate-50 to-blue-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="space-y-3 lg:col-span-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-white border rounded-2xl border-slate-100 animate-pulse">
                    <div className="h-3.5 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="w-1/2 h-3 mb-2 rounded bg-slate-100" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
              <div className="lg:col-span-3">
                <div className="h-64 bg-white border rounded-2xl border-slate-100 animate-pulse" />
              </div>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

              {/* ── Message list ─────────────────────────────────────── */}
              <div className="space-y-3 lg:col-span-2">
                {messages.length === 0 ? (
                  <div className="p-10 text-center bg-white border shadow-sm rounded-2xl border-slate-100">
                    <div className="flex items-center justify-center mx-auto mb-4 w-14 h-14 rounded-2xl bg-slate-50">
                      <Mail size={28} className="text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-500">Geen berichten</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Berichten van IntrICT verschijnen hier
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.button
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelect(msg)}
                      whileHover={{ scale: 1.01 }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                        selected?.id === msg.id
                          ? 'bg-linear-to-br from-violet-50 to-blue-50 border-violet-200 shadow-md'
                          : !msg.read
                          ? 'bg-white border-violet-100 shadow-sm ring-1 ring-violet-100'
                          : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar — IntrICT icon instead of sender initial */}
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                          <Mail size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!msg.read && (
                              <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                            )}
                            <p className={`text-sm truncate ${!msg.read ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>
                              {msg.subject}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.body}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(msg.created_at).toLocaleString('nl-BE')}
                          </p>
                        </div>
                        {selected?.id === msg.id && (
                          <ChevronRight size={16} className="mt-2 text-violet-400 shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* ── Message detail ───────────────────────────────────── */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100"
                    >
                      {/* Header */}
                      <div className="p-6 border-b border-slate-100 bg-linear-to-br from-slate-50 to-violet-50/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start min-w-0 gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-violet-500 to-blue-500 shrink-0">
                              <Mail size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-lg font-bold leading-snug text-slate-800">{selected.subject}</h2>
                              <p className="text-sm text-slate-500 mt-0.5">Van: IntrICT</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(selected.created_at).toLocaleString('nl-BE')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelected(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="mt-5">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setReplyOpen(!replyOpen)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all shadow-sm bg-linear-to-r from-violet-500 to-blue-500 rounded-xl hover:from-violet-600 hover:to-blue-600"
                          >
                            <Reply size={14} />
                            Beantwoorden
                          </motion.button>
                        </div>
                      </div>

                      {/* Reply box */}
                      <AnimatePresence>
                        {replyOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/60">
                              {replySent ? (
                                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                  <CheckCircle2 size={16} />
                                  Antwoord succesvol verstuurd!
                                </div>
                              ) : (
                                <>
                                  <p className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">
                                    Aan: info@intrict.com
                                  </p>
                                  <textarea
                                    rows={4}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Typ je antwoord..."
                                    className="w-full px-4 py-3 text-sm transition-all bg-white border-2 resize-none border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder:text-slate-400"
                                  />

                                  <AnimatePresence>
                                    {replyError && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 px-4 py-3 mt-3 text-sm font-medium text-red-700 border border-red-200 rounded-xl bg-red-50"
                                      >
                                        <AlertCircle size={16} /> Er ging iets mis. Probeer opnieuw.
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <div className="flex justify-end gap-2 mt-3">
                                    <button
                                      onClick={() => { setReplyOpen(false); setReplyError(false); }}
                                      className="px-4 py-2 text-sm font-medium transition-colors text-slate-500 hover:text-slate-700"
                                    >
                                      Annuleren
                                    </button>
                                    <motion.button
                                      whileHover={{ scale: replySending ? 1 : 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={handleReply}
                                      disabled={replySending || !replyText.trim()}
                                      className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-blue-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <Send size={13} />
                                      {replySending ? 'Versturen...' : 'Verstuur'}
                                    </motion.button>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Body */}
                      <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                        {selected.body}
                      </div>

                      {/* Attachment */}
                      {selected.file_url && (
                        <div className="px-6 pb-6">
                          <a
                            href={selected.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                          >
                            <Paperclip size={14} />
                            {selected.file_name ?? 'Bijlage downloaden'}
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-16 text-center bg-white border shadow-sm rounded-2xl border-slate-100"
                    >
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border rounded-2xl bg-linear-to-br from-slate-50 to-violet-50 border-slate-100">
                        <Mail size={32} className="text-slate-300" />
                      </div>
                      <p className="font-medium text-slate-500">Selecteer een bericht</p>
                      <p className="mt-1 text-sm text-slate-400">Kies een bericht uit de lijst om te lezen</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </div>
      </section>
    </div>
  );
}