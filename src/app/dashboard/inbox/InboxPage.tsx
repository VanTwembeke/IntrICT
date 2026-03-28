'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, X, Reply, Paperclip, Users,
  ChevronRight, AlertCircle, CheckCircle2, Inbox,
  FileText, Clock,
} from 'lucide-react';

interface InboundEmail {
  id: string;
  from: string;
  subject: string;
  html: string;
  received_at: string;
}

interface UserMessage {
  id: string;
  from_id: string;
  to_id: string;
  subject: string;
  body: string;
  file_name?: string;
  file_url?: string;
  read: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name?: string | null; // ✅ allow null
  role: string;
}

interface Props {
  profile: Profile;
  customers?: Profile[];
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 p-4 border rounded-xl border-white/5 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
          <div className="flex-1 pt-1 space-y-2">
            <div className="w-2/3 h-3 rounded bg-white/10" />
            <div className="h-2.5 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center mb-4 border w-14 h-14 rounded-2xl bg-white/5 border-white/8">
        <Inbox size={24} className="text-slate-600" />
      </div>
      <p className="font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-600">Berichten verschijnen hier automatisch</p>
    </div>
  );
}

export default function InboxPage({ profile, customers = [] }: Props) {
  const isAdmin = profile.role === 'admin';

  /* ── Admin: inbound emails ─────────────────────────────────────────── */
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent] = useState(false);

  /* ── User: received messages ────────────────────────────────────────── */
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<UserMessage | null>(null);

  /* ── Compose modal ─────────────────────────────────────────────────── */
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendFile, setSendFile] = useState<File | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);

  /* ── Fetch inbound (admin only) ────────────────────────────────────── */
  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/inbox')
      .then((r) => r.json())
      .then((d) => { setEmails(d.emails ?? []); setEmailsLoading(false); })
      .catch(() => setEmailsLoading(false));
  }, [isAdmin]);

  /* ── Fetch user messages (both roles, poll) ────────────────────────── */
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/inbox/messages');
      const d = await res.json();
      setMessages(d.messages ?? []);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 30_000);
    return () => clearInterval(t);
  }, [fetchMessages]);

  const markRead = async (id: string) => {
    setMessages((p) => p.map((m) => m.id === id ? { ...m, read: true } : m));
    await fetch('/api/inbox/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const handleSelectMsg = (msg: UserMessage) => {
    setSelectedMsg(msg);
    if (!msg.read) markRead(msg.id);
  };

  /* ── Reply ─────────────────────────────────────────────────────────── */
  const handleReply = async () => {
    if (!selectedEmail || !replyText.trim()) return;
    setReplySending(true);
    await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: selectedEmail.from, subject: `Re: ${selectedEmail.subject}`, message: replyText }),
    });
    setReplySending(false); setReplySent(true); setReplyText('');
    setTimeout(() => { setReplySent(false); setReplyOpen(false); }, 2500);
  };

  /* ── Send to customer ──────────────────────────────────────────────── */
  const handleSend = async () => {
    if (!sendTo || !sendSubject || !sendMessage.trim()) return;
    setSendLoading(true); setSendResult(null);
    try {
      const fd = new FormData();
      fd.append('to', sendTo); fd.append('subject', sendSubject); fd.append('message', sendMessage);
      if (sendFile) fd.append('file', sendFile);
      const res = await fetch('/api/inbox/send', { method: 'POST', body: fd });
      setSendResult(res.ok ? 'success' : 'error');
      if (res.ok) { setSendTo(''); setSendSubject(''); setSendMessage(''); setSendFile(null); }
    } catch { setSendResult('error'); }
    finally { setSendLoading(false); setTimeout(() => setSendResult(null), 4000); }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  /* ─────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Dot-grid texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* ── Hero ── */}
      <section className="relative px-4 pt-24 pb-8 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 shadow-xl rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-blue-900/40">
              <Inbox size={24} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                {isAdmin ? 'Administrator' : 'Klant'}
              </p>
              <h1 className="text-3xl font-bold text-white">Inbox</h1>
              {!isAdmin && unreadCount > 0 && (
                <p className="text-sm text-blue-400 mt-0.5">{unreadCount} ongelezen</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSendOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
            >
              <Send size={15} /> Bericht sturen
            </motion.button>
          )}
        </div>
      </section>

      <div className="relative px-4 pb-20 mx-auto sm:px-6 lg:px-8 max-w-7xl">

        {/* ── User: received messages ── */}
        {!isAdmin && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              {messagesLoading ? <SkeletonList /> : messages.length === 0 ? (
                <EmptyState label="Nog geen berichten ontvangen" />
              ) : messages.map((msg, i) => (
                <motion.button
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelectMsg(msg)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedMsg?.id === msg.id
                      ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 shadow-lg shadow-blue-900/20'
                      : 'bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">I</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                        <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-white' : 'text-slate-300'}`}>{msg.subject}</p>
                      </div>
                      <p className="text-xs truncate text-slate-500">{msg.body.slice(0, 60)}{msg.body.length > 60 ? '…' : ''}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock size={10} className="text-slate-600" />
                        <p className="text-xs text-slate-600">{new Date(msg.created_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        {msg.file_name && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                            <Paperclip size={9} /> bijlage
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedMsg?.id === msg.id && <ChevronRight size={14} className="mt-2 text-blue-400 shrink-0" />}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {selectedMsg ? (
                  <motion.div key={selectedMsg.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border rounded-2xl border-white/10 bg-white/3 backdrop-blur-sm"
                  >
                    <div className="p-6 border-b border-white/8 bg-linear-to-r from-white/5 to-transparent">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-white">{selectedMsg.subject}</h2>
                          <p className="mt-1 text-sm text-slate-400">Van: IntrICT</p>
                          <p className="text-xs text-slate-600 mt-0.5">{new Date(selectedMsg.created_at).toLocaleString('nl-BE')}</p>
                        </div>
                        <button onClick={() => setSelectedMsg(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><X size={16} /></button>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">{selectedMsg.body}</p>
                      {selectedMsg.file_name && selectedMsg.file_url && (
                        <a href={selectedMsg.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 mt-6 transition-all border rounded-xl border-blue-500/20 bg-blue-500/6 hover:bg-blue-500/10 group"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/20"><FileText size={16} className="text-blue-400" /></div>
                          <div>
                            <p className="text-sm font-semibold text-blue-300 transition-colors group-hover:text-blue-200">{selectedMsg.file_name}</p>
                            <p className="text-xs text-slate-600 mt-0.5">Klik om te downloaden</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-16 text-center border rounded-2xl border-white/8 bg-white/2"
                  >
                    <Mail size={32} className="mx-auto mb-3 text-slate-700" />
                    <p className="text-slate-500">Selecteer een bericht</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Admin: inbound emails ── */}
        {isAdmin && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              {emailsLoading ? <SkeletonList /> : emails.length === 0 ? (
                <EmptyState label="Geen inkomende berichten" />
              ) : emails.map((email, i) => (
                <motion.button
                  key={email.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => { setSelectedEmail(email); setReplyOpen(false); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedEmail?.id === email.id
                      ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 shadow-lg shadow-blue-900/20'
                      : 'bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{email.from[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{email.from}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{email.subject}</p>
                      <p className="mt-1 text-xs text-slate-600">{new Date(email.received_at).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    {selectedEmail?.id === email.id && <ChevronRight size={14} className="mt-2 text-blue-400 shrink-0" />}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {selectedEmail ? (
                  <motion.div key={selectedEmail.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border rounded-2xl border-white/10 bg-white/3 backdrop-blur-sm"
                  >
                    <div className="p-6 border-b border-white/8 bg-linear-to-r from-white/5 to-transparent">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start min-w-0 gap-3">
                          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-linear-to-br from-slate-600 to-slate-700 shrink-0">{selectedEmail.from[0].toUpperCase()}</div>
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold leading-snug text-white">{selectedEmail.subject}</h2>
                            <p className="text-sm text-slate-400 mt-0.5 truncate">Van: {selectedEmail.from}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{new Date(selectedEmail.received_at).toLocaleString('nl-BE')}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedEmail(null)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"><X size={16} /></button>
                      </div>
                      <button
                        onClick={() => setReplyOpen(!replyOpen)}
                        className="flex items-center gap-2 px-4 py-2 mt-4 text-sm font-semibold text-white transition-all shadow-md bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600"
                      >
                        <Reply size={14} /> Beantwoorden
                      </button>
                    </div>

                    <AnimatePresence>
                      {replyOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-white/8">
                          <div className="p-6 bg-white/2">
                            {replySent ? (
                              <div className="flex items-center gap-2 text-sm font-semibold text-green-400"><CheckCircle2 size={16} /> Antwoord verstuurd!</div>
                            ) : (
                              <>
                                <p className="mb-3 text-xs font-bold tracking-wider uppercase text-slate-500">Aan: {selectedEmail.from}</p>
                                <textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Typ je antwoord..."
                                  className="w-full px-4 py-3 text-sm transition-all border resize-none bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-slate-200 placeholder:text-slate-600" />
                                <div className="flex justify-end gap-2 mt-3">
                                  <button onClick={() => setReplyOpen(false)} className="px-4 py-2 text-sm transition-colors text-slate-500 hover:text-slate-300">Annuleren</button>
                                  <button onClick={handleReply} disabled={replySending || !replyText.trim()}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white transition-all bg-linear-to-r from-blue-500 to-purple-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send size={13} />{replySending ? 'Versturen...' : 'Verstuur'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-6 prose-sm prose prose-invert max-w-none prose-a:text-blue-400" dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-16 text-center border rounded-2xl border-white/8 bg-white/2">
                    <Mail size={32} className="mx-auto mb-3 text-slate-700" />
                    <p className="text-slate-500">Selecteer een bericht om te lezen</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* ── Compose modal ── */}
      <AnimatePresence>
        {sendOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSendOpen(false); }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg overflow-hidden border shadow-2xl rounded-2xl border-white/10 bg-slate-800/95 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-purple-500"><Send size={14} className="text-white" /></div>
                  <h2 className="text-base font-bold text-white">Nieuw bericht</h2>
                </div>
                <button onClick={() => setSendOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><X size={17} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500"><Users size={10} className="inline mr-1.5" />Ontvanger</label>
                  {customers.filter(c => c.role !== 'admin').length > 0 ? (
                    <select value={sendTo} onChange={(e) => setSendTo(e.target.value)}
                      className="w-full px-4 py-3 text-sm text-white transition-all border appearance-none bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20">
                      <option value="" className="bg-slate-800 text-slate-400">Kies een klant...</option>
                      {customers.filter(c => c.role !== 'admin').map((c) => (
                        <option key={c.id} value={c.email} className="bg-slate-800">{c.full_name ? `${c.full_name} (${c.email})` : c.email}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="email" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="klant@bedrijf.be"
                      className="w-full px-4 py-3 text-sm text-white transition-all border bg-white/5 border-white/10 rounded-xl placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" />
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Onderwerp</label>
                  <input type="text" value={sendSubject} onChange={(e) => setSendSubject(e.target.value)} placeholder="Factuur maart 2025"
                    className="w-full px-4 py-3 text-sm text-white transition-all border bg-white/5 border-white/10 rounded-xl placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Bericht</label>
                  <textarea rows={4} value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} placeholder="Typ je bericht..."
                    className="w-full px-4 py-3 text-sm text-white transition-all border resize-none bg-white/5 border-white/10 rounded-xl placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500"><Paperclip size={10} className="inline mr-1.5" />Bijlage (optioneel)</label>
                  <label className="flex items-center gap-3 px-4 py-3 transition-all border border-dashed cursor-pointer border-white/10 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 group">
                    <Paperclip size={14} className="transition-colors text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="text-sm truncate transition-colors text-slate-600 group-hover:text-slate-300">{sendFile ? sendFile.name : 'Klik om een bestand te kiezen...'}</span>
                    <input type="file" className="hidden" onChange={(e) => setSendFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {sendFile && (
                    <button onClick={() => setSendFile(null)} className="mt-1.5 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"><X size={10} /> Verwijder bijlage</button>
                  )}
                </div>

                <AnimatePresence>
                  {sendResult && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${sendResult === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {sendResult === 'success' ? <><CheckCircle2 size={15} /> Bericht succesvol verstuurd!</> : <><AlertCircle size={15} /> Er ging iets mis. Probeer opnieuw.</>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setSendOpen(false)} className="flex-1 py-3 text-sm font-semibold transition-all border text-slate-400 border-white/10 rounded-xl hover:bg-white/5 hover:text-white">Annuleren</button>
                  <motion.button whileHover={{ scale: sendLoading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSend}
                    disabled={sendLoading || !sendTo || !sendSubject || !sendMessage.trim()}
                    className="flex items-center justify-center flex-1 gap-2 py-3 text-sm font-semibold text-white transition-all shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send size={13} />{sendLoading ? 'Versturen...' : 'Verstuur'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}