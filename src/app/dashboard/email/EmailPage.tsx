'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Paperclip,
  X,
} from 'lucide-react';
import type { Profile } from '@/lib/types';

interface EmailPageProps {
  profile: Profile;
  allProfiles: Array<{
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    company: string | null;
  }>;
}

export default function EmailPage({ profile, allProfiles }: EmailPageProps) {
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(profile.full_name || 'Jonas');
  const [senderCompany, setSenderCompany] = useState(profile.company || 'Intrict');
  const [includeCta, setIncludeCta] = useState(false);
  const [ctaText, setCtaText] = useState('Meer informatie');
  const [ctaUrl, setCtaUrl] = useState('https://intrict.com');
  const [includeAdditionalContent, setIncludeAdditionalContent] = useState(false);
  const [additionalContent, setAdditionalContent] = useState('');
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);

  // Template customization fields
  const [headerSubtitle, setHeaderSubtitle] = useState('Professioneel bericht');
  const [greeting, setGreeting] = useState('');
  const [signatureName, setSignatureName] = useState('Jonas');
  const [signatureTitle, setSignatureTitle] = useState('Oprichter & CEO');
  const [contactEmail, setContactEmail] = useState('info@intrict.com');
  const [contactPhone, setContactPhone] = useState('+32 123 45 67 89');
  const [contactAddress, setContactAddress] = useState('Gent, België');
  const [companyName, setCompanyName] = useState('IntrICT');
  const [companyTagline, setCompanyTagline] = useState('Moderne websites die werken');
  const [websiteUrl, setWebsiteUrl] = useState('https://intrict.com');
  const [websiteDisplay, setWebsiteDisplay] = useState('www.intrict.com');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<Array<{
    email: string;
    success: boolean;
    error?: string;
  }>>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSendEmails = async () => {
    if (!subject.trim() || !message.trim() || selectedRecipients.length === 0) {
      return;
    }

    setSending(true);
    setSendResults([]);
    setShowResults(false);

    const results: Array<{
      email: string;
      success: boolean;
      error?: string;
    }> = [];

    // Send emails one by one to track individual results
    for (const recipientId of selectedRecipients) {
      const recipient = allProfiles.find(p => p.id === recipientId);
      if (!recipient) continue;

      try {
        const formData = new FormData();
        formData.append('recipientEmail', recipient.email);
        formData.append('recipientName', recipient.full_name || recipient.email);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('includeCta', includeCta.toString());
        formData.append('ctaText', ctaText);
        formData.append('ctaUrl', ctaUrl);
        formData.append('includeAdditionalContent', includeAdditionalContent.toString());
        formData.append('additionalContent', additionalContent);
        formData.append('includeDisclaimer', includeDisclaimer.toString());
        // Template customization fields
        formData.append('headerSubtitle', headerSubtitle);
        formData.append('greeting', greeting);
        formData.append('signatureName', signatureName);
        formData.append('signatureTitle', signatureTitle);
        formData.append('contactEmail', contactEmail);
        formData.append('contactPhone', contactPhone);
        formData.append('contactAddress', contactAddress);
        formData.append('companyName', companyName);
        formData.append('companyTagline', companyTagline);
        formData.append('websiteUrl', websiteUrl);
        formData.append('websiteDisplay', websiteDisplay);

        // Add attachments
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        const response = await fetch('/api/email/send', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          results.push({
            email: recipient.email,
            success: true,
          });
        } else {
          results.push({
            email: recipient.email,
            success: false,
            error: data.error || 'Onbekende fout',
          });
        }
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error instanceof Error ? error.message : 'Netwerkfout',
        });
      }
    }

    setSendResults(results);
    setShowResults(true);
    setSending(false);

    // Reset form if all emails were successful
    if (results.every(r => r.success)) {
      setSelectedRecipients([]);
      setSubject('');
      setMessage('');
      setSenderName(profile.full_name || 'Jonas');
      setSenderCompany(profile.company || 'Intrict');
      setIncludeCta(false);
      setCtaText('Meer informatie');
      setCtaUrl('https://intrict.com');
      setIncludeAdditionalContent(false);
      setAdditionalContent('');
      setIncludeDisclaimer(true);
      setHeaderSubtitle('Professioneel bericht');
      setGreeting('');
      setSignatureName('Jonas');
      setSignatureTitle('Oprichter & CEO');
      setContactEmail('info@intrict.com');
      setContactPhone('+32 123 45 67 89');
      setContactAddress('Gent, België');
      setCompanyName('IntrICT');
      setCompanyTagline('Professionele IT-oplossingen voor bedrijven');
      setWebsiteUrl('https://intrict.com');
      setWebsiteDisplay('www.intrict.com');
      setAttachments([]); // Reset attachments
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const selectAllRecipients = () => {
    setSelectedRecipients(allProfiles.map(p => p.id));
  };

  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`Bestand ${file.name} is te groot. Maximum grootte is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`Bestandstype ${file.type} wordt niet ondersteund.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Group profiles by role
  const adminProfiles = allProfiles.filter(p => p.role === 'admin');
  const userProfiles = allProfiles.filter(p => p.role !== 'admin');

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
              <ArrowLeft size={20} />
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
              Email{' '}
              <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                Versturen
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
              Verstuur professionele emails naar gebruikers met een mooie template
              en volledige controle over de inhoud.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
              {[
                { label: 'Beschikbare Ontvangers', value: allProfiles.length.toString() },
                { label: 'Geselecteerd', value: selectedRecipients.length.toString() },
                { label: 'Email Template', value: 'Professioneel' },
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

      {/* ── Email Interface ────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden bg-white shadow-xl rounded-2xl"
          >
            <div className="flex" style={{ minHeight: '700px' }}>

              {/* ── Recipients Sidebar ───────────────────────────────────── */}
              <div className="flex flex-col border-r w-80 border-slate-200 bg-slate-50">
                <div className="p-6 bg-white border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Ontvangers</h2>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={selectAllRecipients}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-xs font-medium text-blue-600 rounded-lg bg-blue-50 hover:bg-blue-100"
                      >
                        Alles
                      </motion.button>
                      <motion.button
                        onClick={clearAllRecipients}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200"
                      >
                        Wissen
                      </motion.button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedRecipients.length} van {allProfiles.length} geselecteerd
                  </p>
                </div>

                {/* Recipients list */}
                <div className="flex-1 overflow-y-auto">
                  {/* Admins */}
                  {adminProfiles.length > 0 && (
                    <div className="p-4">
                      <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-slate-700">
                        Administrators
                      </h3>
                      <div className="space-y-2">
                        {adminProfiles.map((recipient) => (
                          <motion.button
                            key={recipient.id}
                            onClick={() => toggleRecipient(recipient.id)}
                            whileHover={{ backgroundColor: 'rgba(59,130,246,0.05)' }}
                            className={`w-full p-3 text-left border rounded-lg transition-all ${
                              selectedRecipients.includes(recipient.id)
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedRecipients.includes(recipient.id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-slate-300'
                              }`}>
                                {selectedRecipients.includes(recipient.id) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {recipient.full_name || recipient.email}
                                </p>
                                <p className="text-sm truncate text-slate-500">
                                  {recipient.email}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Users */}
                  {userProfiles.length > 0 && (
                    <div className="p-4 border-t border-slate-200">
                      <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase text-slate-700">
                        Gebruikers
                      </h3>
                      <div className="space-y-2">
                        {userProfiles.map((recipient) => (
                          <motion.button
                            key={recipient.id}
                            onClick={() => toggleRecipient(recipient.id)}
                            whileHover={{ backgroundColor: 'rgba(59,130,246,0.05)' }}
                            className={`w-full p-3 text-left border rounded-lg transition-all ${
                              selectedRecipients.includes(recipient.id)
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedRecipients.includes(recipient.id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-slate-300'
                              }`}>
                                {selectedRecipients.includes(recipient.id) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {recipient.full_name || recipient.email}
                                </p>
                                <p className="text-sm truncate text-slate-500">
                                  {recipient.email}
                                </p>
                                {recipient.company && (
                                  <p className="text-xs truncate text-slate-400">
                                    {recipient.company}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Email Composer ──────────────────────────────────────── */}
              <div className="flex flex-col flex-1">
                <div className="p-6 bg-white border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800">Email Opstellen</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Verstuur een professionele email naar de geselecteerde ontvangers
                  </p>
                </div>

                <div className="flex-1 p-6 space-y-6">
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
                      placeholder="Schrijf je bericht hier... HTML formatting wordt ondersteund."
                      className="w-full p-3 transition-all border resize-none border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                      rows={8}
                      disabled={sending}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      {message.length} tekens • HTML tags worden ondersteund voor opmaak
                    </p>
                  </div>

                  {/* Optional Elements */}
                  <div className="pt-6 space-y-6 border-t border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800">Optionele elementen</h4>

                    {/* CTA Button */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="includeCta"
                          checked={includeCta}
                          onChange={(e) => setIncludeCta(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded bg-slate-100 border-slate-300 focus:ring-blue-500 focus:ring-2"
                          disabled={sending}
                        />
                        <label htmlFor="includeCta" className="text-sm font-medium text-slate-700">
                          Call-to-Action knop toevoegen
                        </label>
                      </div>

                      {includeCta && (
                        <div className="space-y-3 ml-7">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-slate-600">
                              Knop tekst
                            </label>
                            <input
                              type="text"
                              value={ctaText}
                              onChange={(e) => setCtaText(e.target.value)}
                              placeholder="Meer informatie"
                              className="w-full p-2 text-sm border rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={sending}
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-slate-600">
                              Knop URL
                            </label>
                            <input
                              type="url"
                              value={ctaUrl}
                              onChange={(e) => setCtaUrl(e.target.value)}
                              placeholder="https://intrict.com"
                              className="w-full p-2 text-sm border rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={sending}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Content */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="includeAdditionalContent"
                          checked={includeAdditionalContent}
                          onChange={(e) => setIncludeAdditionalContent(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded bg-slate-100 border-slate-300 focus:ring-blue-500 focus:ring-2"
                          disabled={sending}
                        />
                        <label htmlFor="includeAdditionalContent" className="text-sm font-medium text-slate-700">
                          Extra inhoud toevoegen
                        </label>
                      </div>

                      {includeAdditionalContent && (
                        <div className="ml-7">
                          <textarea
                            value={additionalContent}
                            onChange={(e) => setAdditionalContent(e.target.value)}
                            placeholder="Voeg extra informatie toe die in een apart vak wordt weergegeven..."
                            className="w-full p-3 text-sm border rounded-lg resize-none border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            disabled={sending}
                          />
                        </div>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="includeDisclaimer"
                        checked={includeDisclaimer}
                        onChange={(e) => setIncludeDisclaimer(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded bg-slate-100 border-slate-300 focus:ring-blue-500 focus:ring-2"
                        disabled={sending}
                      />
                      <label htmlFor="includeDisclaimer" className="text-sm font-medium text-slate-700">
                        Disclaimer toevoegen (aanbevolen)
                      </label>
                    </div>
                  </div>
                    {/* Attachments Section */}
                    <div className="pt-6 space-y-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">
                          Bijlagen
                        </label>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium bg-white border rounded-md shadow-sm cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Paperclip className="w-4 h-4 mr-2" />
                          Bijlage toevoegen
                        </label>
                      </div>

                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">Geselecteerde bijlagen:</p>
                          <div className="space-y-2">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-md bg-slate-50"
                              >
                                <div className="flex items-center space-x-3">
                                  <Paperclip className="w-4 h-4 text-slate-400" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  {/* Template Customization */}
                  <div className="pt-6 space-y-6 border-t border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800">Template aanpassen</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Header Subtitle */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Header ondertitel
                        </label>
                        <input
                          type="text"
                          value={headerSubtitle}
                          onChange={(e) => setHeaderSubtitle(e.target.value)}
                          placeholder="Professioneel bericht"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Greeting */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Begroeting (optioneel)
                        </label>
                        <input
                          type="text"
                          value={greeting}
                          onChange={(e) => setGreeting(e.target.value)}
                          placeholder="Laat leeg voor standaard begroeting"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Signature Name */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Ondertekeningsnaam
                        </label>
                        <input
                          type="text"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          placeholder="Jonas"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Signature Title */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Functie/titel
                        </label>
                        <input
                          type="text"
                          value={signatureTitle}
                          onChange={(e) => setSignatureTitle(e.target.value)}
                          placeholder="Oprichter & CEO"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Contact e-mail
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="info@intrict.com"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Telefoonnummer
                        </label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="+32 123 45 67 89"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Contact Address */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Adres
                        </label>
                        <input
                          type="text"
                          value={contactAddress}
                          onChange={(e) => setContactAddress(e.target.value)}
                          placeholder="Gent, België"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Bedrijfsnaam
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="IntrICT"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Company Tagline */}
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Bedrijfs slogan/tagline
                        </label>
                        <input
                          type="text"
                          value={companyTagline}
                          onChange={(e) => setCompanyTagline(e.target.value)}
                          placeholder="Professionele IT-oplossingen voor bedrijven"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Website URL */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://intrict.com"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>

                      {/* Website Display */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                          Website weergave
                        </label>
                        <input
                          type="text"
                          value={websiteDisplay}
                          onChange={(e) => setWebsiteDisplay(e.target.value)}
                          placeholder="www.intrict.com"
                          className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                          disabled={sending}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sender Information */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Jouw Naam
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Jouw volledige naam"
                        className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                        disabled={sending}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Bedrijfsnaam
                      </label>
                      <input
                        type="text"
                        value={senderCompany}
                        onChange={(e) => setSenderCompany(e.target.value)}
                        placeholder="Naam van je bedrijf"
                        className="w-full p-3 transition-all border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
                        disabled={sending}
                      />
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Email Template Voorbeeld</h4>
                        <p className="mt-1 text-sm text-blue-700">
                          De email wordt verstuurd met een professionele template inclusief je naam ({profile.full_name || profile.email})
                          {profile.company && ` van ${profile.company}`}.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Send Results */}
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 border rounded-lg bg-slate-50"
                    >
                      <h4 className="mb-3 font-semibold text-slate-900">Verzendresultaten</h4>
                      <div className="space-y-2">
                        {sendResults.map((result, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            {result.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">{result.email}</span>
                            <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                              {result.success ? 'Verstuurd' : `Fout: ${result.error}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Send Button */}
                <div className="p-6 border-t bg-slate-50 border-slate-200">
                  <motion.button
                    onClick={handleSendEmails}
                    disabled={sending || !subject.trim() || !message.trim() || selectedRecipients.length === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center w-full gap-3 px-6 py-3 font-semibold text-white transition-all shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Emails versturen...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Verstuur naar {selectedRecipients.length} ontvanger{selectedRecipients.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}