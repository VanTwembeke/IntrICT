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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Banner Section - Direct onder header */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Privacy en gegevensbescherming - Moderne beveiliging en transparantie"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                Privacybeleid
              </h1>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Transparantie en vertrouwen staan centraal in hoe ik omga met jouw persoonlijke gegevens
              </p>
            </div>
          </div>
        </section>

                <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="prose prose-lg max-w-none">

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Inleiding</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Dit privacybeleid beschrijft hoe ik, als web developer, omga met persoonlijke gegevens 
                  die ik verzamel via mijn website en diensten. Ik respecteer je privacy en ben transparant 
                  over hoe ik je gegevens gebruik.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevens die ik verzamel</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Contactgegevens</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Wanneer je contact met me opneemt via het contactformulier, verzamel ik je naam, 
                      e-mailadres en eventuele andere informatie die je vrijwillig deelt.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Website analytics</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Ik gebruik Google Analytics om te begrijpen hoe bezoekers mijn website gebruiken. 
                      Dit omvat anonieme gegevens over je bezoek.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">3</span>
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
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600 leading-relaxed text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevens delen</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Ik deel je persoonlijke gegevens niet met derden, behalve in de volgende gevallen:
                </p>
                <div className="space-y-2">
                  {[
                    "Wanneer je hier expliciet toestemming voor hebt gegeven",
                    "Wanneer dit wettelijk verplicht is",
                    "Wanneer dit nodig is om mijn diensten te leveren (bijv. hosting providers)"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">5</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Je rechten</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
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
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-600 leading-relaxed text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-slate-50 border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Contact</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  Voor vragen over dit privacybeleid of over je persoonlijke gegevens, 
                  kun je contact met me opnemen via het contactformulier op mijn website.
                </p>
                <a 
                  href="/#contact" 
                  className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors duration-300"
                >
                  <span>Neem contact op</span>
                  <span>→</span>
                </a>
              </div>
            </section>
                  </div>
                </div>

                {/* Laatst bijgewerkt sectie - Onderaan */}
                <div className="bg-slate-100 py-8 mt-16">
                  <div className="max-w-4xl mx-auto px-4">
                    <p className="text-slate-600 text-center">
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
