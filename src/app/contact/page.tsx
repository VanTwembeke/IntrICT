'use client';

import { useEffect, useState, useActionState } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { sendContactForm, type ContactFormState } from '@/app/actions/contact';
import InlineAppointmentPicker, { type AppointmentSelection } from './ContactCalendar';
import { CalendarDays, CheckCircle, AlertCircle } from 'lucide-react';

const initialState: ContactFormState = { success: false };
const APPOINTMENT_SUBJECT = 'Plan een afspraak in';

export default function Contact() {
  const [state, formAction, pending] = useActionState(sendContactForm, initialState);
  const [openFaq, setOpenFaq]        = useState<number | null>(null);
  const [availability, setAvailability] = useState('Ma – Zo, 9:00 – 18:00');

  // Form state
  const [onderwerp, setOnderwerp]             = useState('');
  const [apptSelection, setApptSelection]     = useState<AppointmentSelection | null>(null);
  const [apptSubmitting, setApptSubmitting]   = useState(false);
  const [apptError, setApptError]             = useState<string | null>(null);
  const [apptDone, setApptDone]               = useState(false);
  const [apptConfirmed, setApptConfirmed]     = useState<AppointmentSelection | null>(null);
  // Name/email captured from uncontrolled inputs for appointment mode
  const [nameVal, setNameVal]   = useState('');
  const [emailVal, setEmailVal] = useState('');

  const isApptMode = onderwerp === APPOINTMENT_SUBJECT;

  useEffect(() => {
    fetch('/api/working-hours')
      .then((r) => r.json())
      .then((hours: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }[]) => {
        const active = hours.filter((h) => h.is_active);
        if (active.length === 0) { setAvailability('Op afspraak'); return; }
        const dayAbbr = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
        const groups: string[] = [];
        let i = 0;
        while (i < active.length) {
          let j = i;
          while (j + 1 < active.length && active[j + 1].day_of_week === active[j].day_of_week + 1) j++;
          groups.push(
            i === j ? dayAbbr[active[i].day_of_week]
              : `${dayAbbr[active[i].day_of_week]} – ${dayAbbr[active[j].day_of_week]}`
          );
          i = j + 1;
        }
        const first = active[0];
        const allSameTime = active.every((h) => h.start_time === first.start_time && h.end_time === first.end_time);
        const fmt = (t: string) => t.slice(0, 5);
        const timeStr = allSameTime ? `, ${fmt(first.start_time)} – ${fmt(first.end_time)}` : '';
        const caps = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        setAvailability(caps(groups.join(', ') + timeStr));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleAppointmentSubmit = async () => {
    if (!apptSelection || !nameVal.trim() || !emailVal.trim()) return;
    setApptSubmitting(true);
    setApptError(null);

    const [h, m] = apptSelection.time.split(':').map(Number);
    const starts = new Date(apptSelection.date);
    starts.setHours(h, m, 0, 0);

    try {
      const res = await fetch('/api/appointments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name:          nameVal.trim(),
          guest_email:         emailVal.trim(),
          appointment_type_id: apptSelection.type.id,
          starts_at:           starts.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApptError(data.error ?? 'Er is een fout opgetreden.'); return; }
      setApptConfirmed(apptSelection);
      setApptDone(true);
    } catch {
      setApptError('Netwerkfout. Probeer het opnieuw.');
    } finally {
      setApptSubmitting(false);
    }
  };

  const faqItems = [
    {
      vraag: 'Hoe lang duurt het om een website te bouwen?',
      antwoord: 'De doorlooptijd hangt af van de complexiteit van het project. Een eenvoudige website is doorgaans klaar binnen 2 à 3 weken. Een uitgebreider project met maatwerk functionaliteiten kan 4 tot 8 weken in beslag nemen. Tijdens ons eerste gesprek geef ik je een realistische inschatting.',
    },
    {
      vraag: 'Wat kost het laten maken van een website?',
      antwoord: 'Elke opdracht is uniek, dus ik werk altijd op maat. Een eenvoudige landingspagina start vanaf €500, terwijl een volledige webshop of webapp meer kan kosten. Na een kennismakingsgesprek ontvang je een gedetailleerde offerte zonder verborgen kosten.',
    },
    {
      vraag: 'Bied je ook onderhoud en support na oplevering?',
      antwoord: 'Absoluut. Ik bied flexibele onderhoudscontracten aan waarbij ik zorg voor updates, beveiliging en technische ondersteuning. Zo blijft jouw website altijd up-to-date en veilig. Dit wordt apart besproken en afgestemd op jouw behoeften.',
    },
    {
      vraag: 'Kan ik mijn website zelf aanpassen na oplevering?',
      antwoord: "Dat is zeker mogelijk, ik kan altijd voor een gebruiksvriendelijk CMS (zoals een headless CMS of een eenvoudig beheerpaneel) zorgen zodat je zelf teksten, afbeeldingen en pagina's kunt aanpassen. Ik geef ook een korte training zodat je zelfstandig aan de slag kunt.",
    },
    {
      vraag: 'In welke regio werk je?',
      antwoord: 'Ik ben gevestigd in Gent maar werk voor klanten door heel België en Nederland. De meeste samenwerking verloopt online, maar voor een persoonlijk gesprek ben ik ook beschikbaar in de regio Gent en omgeving.',
    },
    {
      vraag: 'Hoe verloopt een samenwerking stap voor stap?',
      antwoord: 'We starten met een gratis kennismakingsgesprek. Daarna ontvang je een offerte en planning. Na akkoord start de ontwerp- en ontwikkelfase, met regelmatige updates en feedbackmomenten. Bij oplevering krijg je een werkende, geoptimaliseerde website plus een korte handleiding.',
    },
  ];

  const contactInfo = [
    { icon: '📧', title: 'E-mail',           value: 'info@intrict.com',    href: 'mailto:info@intrict.com' },
    { icon: '📱', title: 'Telefoon',          value: '+32 470 00 00 00',   href: 'tel:+32470000000' },
    { icon: '📍', title: 'Locatie',           value: 'Gent, België',       href: '#' },
    { icon: '🕐', title: 'Beschikbaarheid',   value: availability,         href: '#' },
  ];

  const onderwerpOpties = [
    APPOINTMENT_SUBJECT,
    'Nieuwe website',
    'Redesign bestaande website',
    'E-commerce',
    'SEO & Performance',
    'Onderhoud & Support',
    'Overige',
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
          </div>
          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                Neem{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Contact
                </span>{' '}
                Op
              </h1>
              <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Heb je een project in gedachten of wil je gewoon kennismaken? Ik hoor het graag.
                Stuur me een bericht en ik reageer binnen 24 uur.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
                {[
                  { label: 'Reactietijd', value: '< 24u' },
                  { label: 'Gratis Kennismaking', value: '30 min' },
                  { label: 'Projecten Opgeleverd', value: '0' },
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

        {/* Contact info cards */}
        <section className="py-16 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  className="flex flex-col items-center p-6 text-center transition-all duration-300 border border-blue-100 cursor-pointer bg-linear-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-lg hover:border-blue-200"
                >
                  <div className="mb-3 text-3xl">{item.icon}</div>
                  <div className="mb-1 text-sm font-medium text-slate-500">{item.title}</div>
                  <div className="font-semibold text-slate-800">{item.value}</div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Side Info */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-start grid-cols-1 gap-12 lg:grid-cols-5">

              {/* Form card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <div className="p-8 bg-white shadow-lg rounded-2xl md:p-10">
                  <h2 className="mb-2 text-3xl font-bold text-slate-800">
                    Stuur een{' '}
                    <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                      Bericht
                    </span>
                  </h2>
                  <p className="mb-8 text-slate-500">
                    Vul het formulier in of plan meteen een gesprek in.
                  </p>

                  {/* ── Appointment success ───────────────────────────────── */}
                  {apptDone && apptConfirmed ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center py-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle size={32} className="text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Afspraak aangevraagd!</h3>
                      <p className="text-slate-500 text-sm mb-6 max-w-xs">
                        We bevestigen zo snel mogelijk per e-mail op <strong>{emailVal}</strong>.
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm space-y-1 text-left w-full max-w-xs mb-6">
                        <p><span className="font-semibold text-slate-600">Type:</span> {apptConfirmed.type.name}</p>
                        <p className="capitalize"><span className="font-semibold text-slate-600">Datum:</span> {apptConfirmed.date.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p><span className="font-semibold text-slate-600">Tijdstip:</span> {apptConfirmed.time}</p>
                      </div>
                      <button
                        onClick={() => { setApptDone(false); setApptConfirmed(null); setApptSelection(null); setOnderwerp(''); }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Nieuw bericht sturen
                      </button>
                    </motion.div>

                  /* ── Message success ──────────────────────────────────── */
                  ) : state.success ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="mb-4 text-6xl">🎉</div>
                      <h3 className="mb-2 text-2xl font-bold text-slate-800">Bericht Verstuurd!</h3>
                      <p className="max-w-sm text-slate-500">
                        Bedankt voor je bericht. Je ontvangt een bevestigingsmail en ik neem binnen
                        24 uur contact met je op.
                      </p>
                    </motion.div>

                  /* ── Form ─────────────────────────────────────────────── */
                  ) : (
                    <form
                      action={formAction}
                      onSubmit={(e) => { if (isApptMode) e.preventDefault(); }}
                      className="space-y-6"
                    >
                      {state.error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 p-4 border border-red-200 rounded-xl bg-red-50"
                        >
                          <span className="text-red-500 shrink-0">⚠️</span>
                          <p className="text-sm text-red-700">{state.error}</p>
                        </motion.div>
                      )}

                      {/* Name + Email */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="naam" className="block mb-2 text-sm font-semibold text-slate-700">
                            Naam <span className="text-blue-500">*</span>
                          </label>
                          <input
                            id="naam"
                            type="text"
                            name="naam"
                            required
                            placeholder="Jan Janssen"
                            value={nameVal}
                            onChange={(e) => setNameVal(e.target.value)}
                            className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-700">
                            E-mail <span className="text-blue-500">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="jan@bedrijf.be"
                            value={emailVal}
                            onChange={(e) => setEmailVal(e.target.value)}
                            className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Phone + Subject */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="telefoon" className="block mb-2 text-sm font-semibold text-slate-700">
                            Telefoon
                          </label>
                          <input
                            id="telefoon"
                            type="tel"
                            name="telefoon"
                            placeholder="+32 470 00 00 00"
                            className="w-full px-4 py-3 transition-all duration-200 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="onderwerp" className="block mb-2 text-sm font-semibold text-slate-700">
                            Onderwerp <span className="text-blue-500">*</span>
                          </label>
                          <select
                            id="onderwerp"
                            name="onderwerp"
                            required
                            value={onderwerp}
                            onChange={(e) => { setOnderwerp(e.target.value); setApptSelection(null); }}
                            className="w-full px-4 py-3 transition-all duration-200 bg-white border-2 appearance-none cursor-pointer border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                          >
                            <option value="" disabled>Selecteer een onderwerp</option>
                            {onderwerpOpties.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Inline appointment picker — shown when subject = plan een afspraak */}
                      <AnimatePresence>
                        {isApptMode && (
                          <motion.div
                            key="appt-picker"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-1 pb-1 border-t border-slate-100">
                              <div className="flex items-center gap-2 mb-4 mt-3">
                                <CalendarDays size={16} className="text-blue-500" />
                                <span className="text-sm font-semibold text-slate-700">Kies een datum en tijdstip</span>
                              </div>
                              <InlineAppointmentPicker onChange={setApptSelection} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Message textarea — hidden in appointment mode */}
                      <AnimatePresence>
                        {!isApptMode && (
                          <motion.div
                            key="message-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <label htmlFor="bericht" className="block mb-2 text-sm font-semibold text-slate-700">
                              Bericht <span className="text-blue-500">*</span>
                            </label>
                            <textarea
                              id="bericht"
                              name="bericht"
                              required={!isApptMode}
                              rows={6}
                              placeholder="Vertel me over je project, idee of vraag..."
                              className="w-full px-4 py-3 transition-all duration-200 border-2 resize-none border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Appointment error */}
                      {isApptMode && apptError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                          <AlertCircle size={15} className="mt-0.5 shrink-0" />
                          {apptError}
                        </div>
                      )}

                      {/* Submit */}
                      {isApptMode ? (
                        <motion.button
                          type="button"
                          onClick={handleAppointmentSubmit}
                          disabled={apptSubmitting || !apptSelection || !nameVal.trim() || !emailVal.trim()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {apptSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Bezig met inplannen...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <CalendarDays size={18} />
                              {apptSelection
                                ? `Bevestig afspraak op ${apptSelection.date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })} om ${apptSelection.time}`
                                : 'Kies eerst een datum en tijdstip'}
                            </span>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          type="submit"
                          disabled={pending}
                          whileHover={{ scale: pending ? 1 : 1.02 }}
                          whileTap={{ scale: pending ? 1 : 0.98 }}
                          className="w-full py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {pending ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Versturen...
                            </span>
                          ) : (
                            'Bericht Versturen'
                          )}
                        </motion.button>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Side info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-6 lg:col-span-2"
              >
                <div className="p-8 bg-white shadow-lg rounded-2xl">
                  <h3 className="mb-6 text-xl font-bold text-slate-800">Wat kan ik voor je doen?</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: '🌐', text: 'Professionele websites & webapps' },
                      { icon: '🛒', text: 'E-commerce oplossingen' },
                      { icon: '⚡', text: 'Performance & SEO optimalisatie' },
                      { icon: '🎨', text: 'UI/UX Design & Branding' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-center gap-3 text-slate-700">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 border border-blue-100 bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl">
                  <h3 className="mb-4 text-xl font-bold text-slate-800">Gratis Kennismaking</h3>
                  <p className="mb-4 leading-relaxed text-slate-600">
                    Elke samenwerking start met een gratis kennismakingsgesprek. Selecteer{' '}
                    <strong>"Plan een afspraak in"</strong> in het formulier om direct een moment te kiezen.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <CalendarDays size={15} />
                    Geen account nodig
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Waar je me{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  Vindt
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-slate-600">
                Gevestigd in het hartje van Gent, beschikbaar voor heel België.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="overflow-hidden shadow-xl rounded-2xl"
            >
              <div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-slate-800 to-slate-900">
                <span className="text-xl">📍</span>
                <span className="font-semibold text-white">Gent, Oost-Vlaanderen, België</span>
                <a
                  href="https://www.google.com/maps/search/Gent,+Belgium"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 ml-auto text-sm font-semibold text-white transition-all duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Open in Maps
                </a>
              </div>
              <iframe
                title="Locatie Gent"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d80093.76529780734!2d3.6438!3d51.0543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c37161a3c4fcad%3A0x9de2b74cc31a5f4f!2sGent!5e0!3m2!1snl!2sbe!4v1700000000000"
                width="100%"
                height="420"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Veelgestelde{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  Vragen
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl leading-relaxed text-slate-600">
                Staat jouw vraag er niet bij? Neem gerust contact op.
              </p>
            </motion.div>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  viewport={{ once: true }}
                  className="overflow-hidden bg-white shadow-md rounded-2xl"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors duration-200 hover:bg-blue-50 focus:outline-none"
                  >
                    <span className="pr-4 text-lg font-semibold text-slate-800">{item.vraag}</span>
                    <motion.span
                      animate={{ rotate: openFaq === index ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-center text-lg font-bold leading-none text-white rounded-full shrink-0 w-7 h-7 bg-linear-to-r from-blue-500 to-purple-500"
                    >
                      +
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={openFaq === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-8 pb-6 leading-relaxed text-slate-600">{item.antwoord}</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Klaar om te{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Starten?
                </span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Elk groot project begint met een eerste gesprek. Laat je idee niet wachten —
                neem vandaag nog contact op en laten we samen iets moois bouwen.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.a
                  href="mailto:info@intrict.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  Stuur een E-mail
                </motion.a>
                <motion.a
                  href="tel:+32470000000"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                >
                  Bel Direct
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
