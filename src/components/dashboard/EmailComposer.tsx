'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Mail, MessageSquare } from 'lucide-react';

interface EmailComposerProps {
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    company?: string | null;
  };
  recipient: {
    id: string;
    full_name: string | null;
    email: string;
  };
  onClose: () => void;
  onSwitchToMessages: () => void;
}

export default function EmailComposer({
  profile,
  recipient,
  onClose,
  onSwitchToMessages,
}: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Onderwerp en bericht zijn verplicht');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientName: recipient.full_name || recipient.email,
          subject,
          message,
          senderName: profile.full_name || profile.email,
          senderCompany: profile.company,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Email versturen mislukt');
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email versturen mislukt');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 text-white border-b-0 bg-blue-600">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Email Versturen</h2>
              <p className="text-sm text-blue-100">aan {recipient.full_name || recipient.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 text-green-800 border border-green-200 rounded-lg bg-green-50"
            >
              ✓ Email succesvol verstuurd naar {recipient.email}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 text-red-800 border border-red-200 rounded-lg bg-red-50"
            >
              ✕ {error}
            </motion.div>
          )}

          {/* Sender Info */}
          <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
            <p className="mb-2 text-sm text-slate-600">
              <span className="font-semibold">Van:</span> {profile.full_name || profile.email}
            </p>
            {profile.company && (
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Bedrijf:</span> {profile.company}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Onderwerp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Geef het email onderwerp in"
              className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
              disabled={sending}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Bericht <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Schrijf je bericht hier..."
              className="w-full p-3 transition-all border resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
              rows={8}
              disabled={sending}
            />
            <p className="mt-2 text-xs text-slate-500">
              {message.length} tekens • HTML formatting wordt ondersteund
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">ℹ️ Let op:</span> De email wordt formateerd met ons standaard template en ziet er professioneel uit bij de ontvanger.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-slate-50 border-slate-200">
          <motion.button
            onClick={onSwitchToMessages}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold transition-all bg-white border text-slate-700 border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <MessageSquare className="w-4 h-4" />
            Terug naar Berichten
          </motion.button>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 font-semibold transition-all text-slate-700 bg-slate-200 rounded-xl hover:bg-slate-300"
          >
            Annuleren
          </motion.button>
          <motion.button
            onClick={handleSendEmail}
            disabled={sending || !subject.trim() || !message.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold text-white transition-all shadow-sm bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Versturen...' : 'Email Versturen'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
