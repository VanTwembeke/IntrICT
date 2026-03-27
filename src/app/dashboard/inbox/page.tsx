'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, X, Reply } from 'lucide-react';

interface InboundEmail {
  id: string;
  from: string;
  subject: string;
  html: string;
  received_at: string;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [selected, setSelected] = useState<InboundEmail | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setSending(true);

    await fetch('/api/inbox/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selected.from,
        subject: `Re: ${selected.subject}`,
        message: replyText,
      }),
    });

    setSending(false);
    setSent(true);
    setReplyText('');
    setTimeout(() => {
      setSent(false);
      setReplyOpen(false);
    }, 2000);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Inbox</h1>
        <p className="text-slate-500 mt-1">Ontvangen berichten via info@intrict.com</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Email list */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <p className="text-slate-400 text-sm">Laden...</p>
          ) : emails.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <Mail size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Geen berichten gevonden</p>
              <p className="text-slate-300 text-xs mt-1">
                Berichten verschijnen hier nadat de inbound webhook actief is
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <motion.button
                key={email.id}
                onClick={() => {
                  setSelected(email);
                  setReplyOpen(false);
                }}
                whileHover={{ scale: 1.01 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === email.id
                    ? 'bg-linear-to-br from-blue-50 to-purple-50 border-blue-200 shadow-md'
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800 truncate">{email.from}</p>
                <p className="text-sm text-slate-600 truncate mt-0.5">{email.subject}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(email.received_at).toLocaleString('nl-BE')}
                </p>
              </motion.button>
            ))
          )}
        </div>

        {/* Email detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selected.subject}</h2>
                    <p className="text-sm text-slate-500 mt-1">Van: {selected.from}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(selected.received_at).toLocaleString('nl-BE')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setReplyOpen(!replyOpen)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  <Reply size={15} />
                  Beantwoorden
                </button>
              </div>

              {/* Reply box */}
              {replyOpen && (
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  {sent ? (
                    <p className="text-green-600 font-semibold text-sm">Antwoord verstuurd!</p>
                  ) : (
                    <>
                      <textarea
                        rows={5}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Typ je antwoord..."
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400 resize-none text-sm"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleReply}
                          disabled={sending || !replyText.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Send size={14} />
                          {sending ? 'Versturen...' : 'Verstuur antwoord'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Email body */}
              <div
                className="p-6 prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: selected.html }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <Mail size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400">Selecteer een bericht om te lezen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
