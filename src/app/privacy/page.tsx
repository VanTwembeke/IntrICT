/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function Privacy() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Banner Section - Direct onder header */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Privacy en gegevensbescherming - Moderne beveiliging en transparantie"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">
                Privacybeleid
              </h1>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
                Transparantie en vertrouwen staan centraal in hoe ik omga met jouw persoonlijke gegevens
              </p>
            </div>
          </div>
        </section>

                <div className="max-w-4xl px-4 py-16 mx-auto">
          <div className="prose prose-lg max-w-none">

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">1</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Inleiding</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Dit privacybeleid beschrijft hoe ik, als web developer, omga met persoonlijke gegevens 
                  die ik verzamel via mijn website en diensten. Ik respecteer je privacy en ben transparant 
                  over hoe ik je gegevens gebruik.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevens die ik verzamel</h2>
                </div>
                <div className="space-y-4">
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Contactgegevens</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Wanneer je contact met me opneemt via het contactformulier, verzamel ik je naam, 
                      e-mailadres en eventuele andere informatie die je vrijwillig deelt.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Website analytics</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ik gebruik Google Analytics om te begrijpen hoe bezoekers mijn website gebruiken. 
                      Dit omvat anonieme gegevens over je bezoek.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">3</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Hoe ik je gegevens gebruik</h2>
                </div>
                <div className="space-y-3">
                  {[
                    "Om je vragen te beantwoorden en contact met je te onderhouden",
                    "Om mijn website te verbeteren en de gebruikerservaring te optimaliseren",
                    "Om mijn diensten aan te bieden en projecten uit te voeren",
                    "Om wettelijke verplichtingen na te komen"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                      <span className="text-sm leading-relaxed text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevens delen</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Ik deel je persoonlijke gegevens niet met derden, behalve in de volgende gevallen:
                </p>
                <div className="space-y-2">
                  {[
                    "Wanneer je hier expliciet toestemming voor hebt gegeven",
                    "Wanneer dit wettelijk verplicht is",
                    "Wanneer dit nodig is om mijn diensten te leveren (bijv. hosting providers)"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">5</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Je rechten</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Je hebt de volgende rechten met betrekking tot je persoonlijke gegevens:
                </p>
                <div className="space-y-2">
                  {[
                    "Het recht om toegang te krijgen tot je gegevens",
                    "Het recht om je gegevens te corrigeren of bij te werken",
                    "Het recht om je gegevens te laten verwijderen",
                    "Het recht om bezwaar te maken tegen de verwerking",
                    "Het recht op gegevensoverdraagbaarheid"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                      <span className="text-sm leading-relaxed text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 border bg-slate-50 border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Contact</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Voor vragen over dit privacybeleid of over je persoonlijke gegevens, 
                  kun je contact met me opnemen via het contactformulier op mijn website.
                </p>
                <a 
                  href="/#contact" 
                  className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition-colors duration-300 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  <span>Neem contact op</span>
                  <span>→</span>
                </a>
              </div>
            </section>
                  </div>
                </div>

                {/* Laatst bijgewerkt sectie - Onderaan */}
                <div className="py-8 mt-16 bg-slate-100">
                  <div className="max-w-4xl px-4 mx-auto">
                    <p className="text-center text-slate-600">
                      Laatst bijgewerkt: 23 oktober 2024
                    </p>
                  </div>
                </div>
              </main>

              <Footer />
              <BackToTop />
            </div>
          );
        }
