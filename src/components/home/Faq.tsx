'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const QUESTIONS = {
  nl: [
    { question: 'Wat kost mijn project?', answer: 'Maatwerkopdrachten worden op offerte-basis uitgewerkt. Tijdens een kennismaking bespreken we je doelen, de gewenste functies en je budget. De maandelijkse pakketten en eenmalige diensten staan hierboven wanneer ze beschikbaar zijn.' },
    { question: 'Hoe verloopt de samenwerking?', answer: 'We beginnen met je wensen, doelgroep en doelen. Daarna volgen planning, design en ontwikkeling, met regelmatige updates. Timing en scope stemmen we af op je project.' },
    { question: 'Kan ik ook terecht voor ondersteuning?', answer: 'Ja. Naast nieuwe websites help ik met ondersteuning, updates en verdere ontwikkeling. Bespreek wat je nodig hebt, dan bekijken we welke dienst of welk pakket daarbij aansluit.' },
  ],
  en: [
    { question: 'What will my project cost?', answer: 'Custom projects are quote-based. During an introduction we discuss your goals, the features you need and your budget. Monthly packages and one-time services are listed above when available.' },
    { question: 'How does working together work?', answer: 'We start with your needs, audience and goals. Planning, design and development follow, with regular updates. The timeline and scope are tailored to your project.' },
    { question: 'Can I get ongoing support?', answer: 'Yes. Alongside new websites, I help with support, updates and further development. Tell me what you need and we can explore the service or package that fits.' },
  ],
};

export default function Faq() {
  const { lang } = useLanguage();
  return (
    <section lang={lang === 'en' ? 'en' : 'nl-BE'} aria-labelledby="home-faq-heading" className="[font-family:Arial,Helvetica,sans-serif] bg-white px-6 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="mb-3 text-sm font-semibold text-blue-700">{lang === 'en' ? 'Before you get started' : 'Voor je van start gaat'}</p>
          <h2 id="home-faq-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{lang === 'en' ? 'A few practical answers' : 'Een paar praktische antwoorden'}</h2>
          <p className="mt-4 leading-relaxed text-slate-600">{lang === 'en' ? 'A clear starting point for your next conversation.' : 'Een duidelijk vertrekpunt voor je volgende gesprek.'}</p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {QUESTIONS[lang].map(({ question, answer }) => <details key={question} className="group py-1">
            <summary className="min-h-14 cursor-pointer py-4 pr-4 font-semibold text-slate-900 marker:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{question}</summary>
            <p className="pb-5 pr-4 leading-relaxed text-slate-600">{answer}</p>
          </details>)}
        </div>
      </div>
    </section>
  );
}
