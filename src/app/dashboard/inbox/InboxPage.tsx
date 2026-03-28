'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, X, Reply, Paperclip, Users,
  ChevronRight, Inbox, AlertCircle, CheckCircle2,
} from 'lucide-react';

interface InboundEmail {
  id: string;
  from: string;
  subject: string;
  html: string;
  received_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
}

interface Props {
  profile: Profile;
  customers?: Profile[];
}

export default function InboxPage({ profile, customers = [] }: Props) {
  const isAdmin = profile.role === 'admin';

  // ── Email list ──────────────────────────────────────────────────────────────
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [selected, setSelected] = useState<InboundEmail | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Reply ───────────────────────────────────────────────────────────────────
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent] = useState(false);

  // ── Admin: send to customer ─────────────────────────────────────────────────
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendFile, setSendFile] = useState<File | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendResult, setSendResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    fetch('/api/inbox')
      .then((r) => r.json())
      .then((data) => {
        setEmails(data.emails ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplySending(true);
    await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selected.from,
        subject: `Re: ${selected.subject}`,
        message: replyText,
      }),
    });
    setReplySending(false);
    setReplySent(true);
    setReplyText('');
    setTimeout(() => { setReplySent(false); setReplyOpen(false); }, 2500);
  };

  const handleSend = async () => {
    if (!sendTo || !sendSubject || !sendMessage.trim()) return;
    setSendLoading(true);
    setSendResult(null);

    try {
      const formData = new FormData();
      formData.append('to', sendTo);
      formData.append('subject', sendSubject);
      formData.append('message', sendMessage);
      if (sendFile) formData.append('file', sendFile);

      const res = await fetch('/api/inbox/send', { method: 'POST', body: formData });
      setSendResult(res.ok ? 'success' : 'error');
      if (res.ok) {
        setSendTo('');
        setSendSubject('');
        setSendMessage('');
        setSendFile(null);
      }
    } catch {
      setSendResult('error');
    } finally {
      setSendLoading(false);
      setTimeout(() => setSendResult(null), 4000);
    }
  };

  return (
    <div className="p-6 lg:p-10">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 shadow-lg rounded-2xl bg-linear-to-br from-purple-500 to-blue-500 shadow-purple-200">
            <Inbox size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Inbox</h1>
            <p className="text-slate-500 mt-0.5">Ontvangen berichten via info@intrict.com</p>
          </div>
        </div>

        {/* Admin: compose button */}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Send size={15} />
            Bericht sturen
          </motion.button>
        )}
      </div>

      {/* ── Admin: Send modal ── */}
      <AnimatePresence>
        {sendOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSendOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-3xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-purple-500">
                    <Send size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Nieuw bericht</h2>
                </div>
                <button
                  onClick={() => setSendOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    <Users size={13} className="inline mr-1.5 text-slate-400" />
                    Ontvanger
                  </label>
                  {customers.length > 0 ? (
                    <select
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="w-full px-4 py-3 transition-all bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                    >
                      <option value="">Kies een klant...</option>
                      {customers
                        .filter((c) => c.role !== 'admin')
                        .map((c) => (
                          <option key={c.id} value={c.email}>
                            {c.full_name ? `${c.full_name} (${c.email})` : c.email}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="email"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      placeholder="klant@bedrijf.be"
                      className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                    />
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">Onderwerp</label>
                  <input
                    type="text"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    placeholder="Factuur maart 2025"
                    className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">Bericht</label>
                  <textarea
                    rows={4}
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    placeholder="Typ je bericht..."
                    className="w-full px-4 py-3 transition-all border-2 resize-none border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                  />
                </div>

                {/* File attachment */}
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                    <Paperclip size={13} className="inline mr-1.5 text-slate-400" />
                    Bijlage (optioneel)
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 transition-all border-2 border-dashed cursor-pointer border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 group">
                    <Paperclip size={16} className="transition-colors text-slate-400 group-hover:text-blue-400 shrink-0" />
                    <span className="text-sm truncate transition-colors text-slate-500 group-hover:text-blue-500">
                      {sendFile ? sendFile.name : 'Klik om een bestand te kiezen...'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSendFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {sendFile && (
                    <button
                      onClick={() => setSendFile(null)}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <X size={11} /> Verwijder bijlage
                    </button>
                  )}
                </div>

                {/* Result feedback */}
                <AnimatePresence>
                  {sendResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                        sendResult === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {sendResult === 'success'
                        ? <><CheckCircle2 size={16} /> Bericht succesvol verstuurd!</>
                        : <><AlertCircle size={16} /> Er ging iets mis. Probeer opnieuw.</>
                      }
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSendOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold transition-all border-2 text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Annuleren
                  </button>
                  <motion.button
                    whileHover={{ scale: sendLoading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    disabled={sendLoading || !sendTo || !sendSubject || !sendMessage.trim()}
                    className="flex items-center justify-center flex-1 gap-2 py-3 text-sm font-semibold text-white transition-all shadow-md bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    {sendLoading ? 'Versturen...' : 'Verstuur'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Email list */}
        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-white border rounded-2xl border-slate-100 animate-pulse">
                  <div className="h-3.5 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="w-1/2 h-3 mb-2 rounded bg-slate-100" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="p-10 text-center bg-white border shadow-sm rounded-2xl border-slate-100">
              <div className="flex items-center justify-center mx-auto mb-4 w-14 h-14 rounded-2xl bg-slate-50">
                <Mail size={28} className="text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">Geen berichten gevonden</p>
              <p className="mt-1 text-sm text-slate-400">
                Berichten verschijnen hier nadat de inbound webhook actief is
              </p>
            </div>
          ) : (
            emails.map((email, i) => (
              <motion.button
                key={email.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelected(email); setReplyOpen(false); }}
                whileHover={{ scale: 1.01 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === email.id
                    ? 'bg-linear-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md'
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {email.from[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-800">{email.from}</p>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{email.subject}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(email.received_at).toLocaleString('nl-BE')}
                    </p>
                  </div>
                  {selected?.id === email.id && (
                    <ChevronRight size={16} className="mt-2 text-blue-400 shrink-0" />
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Email detail */}
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
                {/* Email header */}
                <div className="p-6 border-b border-slate-100 bg-linear-to-br from-slate-50 to-blue-50/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start min-w-0 gap-3">
                      <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                        {selected.from[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold leading-snug text-slate-800">{selected.subject}</h2>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">Van: {selected.from}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(selected.received_at).toLocaleString('nl-BE')}
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

                  <div className="flex gap-3 mt-5">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setReplyOpen(!replyOpen)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all shadow-sm bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600"
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
                              Aan: {selected.from}
                            </p>
                            <textarea
                              rows={4}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Typ je antwoord..."
                              className="w-full px-4 py-3 text-sm transition-all bg-white border-2 resize-none border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={() => setReplyOpen(false)}
                                className="px-4 py-2 text-sm font-medium transition-colors text-slate-500 hover:text-slate-700"
                              >
                                Annuleren
                              </button>
                              <motion.button
                                whileHover={{ scale: replySending ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleReply}
                                disabled={replySending || !replyText.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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

                {/* Email body */}
                <div
                  className="p-6 prose-sm prose max-w-none text-slate-700 prose-headings:text-slate-800 prose-a:text-blue-500"
                  dangerouslySetInnerHTML={{ __html: selected.html }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-16 text-center bg-white border shadow-sm rounded-2xl border-slate-100"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border rounded-2xl bg-linear-to-br from-slate-50 to-blue-50 border-slate-100">
                  <Mail size={32} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">Selecteer een bericht</p>
                <p className="mt-1 text-sm text-slate-400">Kies een bericht uit de lijst om te lezen</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}