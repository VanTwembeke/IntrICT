'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Paperclip, Inbox } from 'lucide-react';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inbox/messages')
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = async (msg: Message) => {
    setSelected(msg);
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

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 shadow-lg rounded-2xl bg-linear-to-br from-violet-500 to-blue-500 shadow-violet-200">
          <Inbox size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Berichten</h1>
          <p className="text-slate-500 mt-0.5">Berichten van IntrICT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Lijst */}
        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-white border rounded-2xl border-slate-100 animate-pulse">
                <div className="h-3.5 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="w-1/2 h-3 rounded bg-slate-100" />
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="p-10 text-center bg-white border shadow-sm rounded-2xl border-slate-100">
              <Mail size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Geen berichten</p>
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
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!msg.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!msg.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.body}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString('nl-BE')}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-2xl"
              >
                <div className="p-6 border-b border-slate-100 bg-linear-to-br from-slate-50 to-violet-50/30">
                  <h2 className="text-lg font-bold text-slate-800">{selected.subject}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(selected.created_at).toLocaleString('nl-BE')}
                  </p>
                </div>
                <div className="p-6 text-sm whitespace-pre-wrap text-slate-700">
                  {selected.body}
                </div>
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
                <Mail size={32} className="mx-auto mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">Selecteer een bericht</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}