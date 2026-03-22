'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function GDPR() {
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
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="GDPR compliance - Europese privacywetgeving en gegevensbescherming"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                GDPR Informatie
              </h1>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Jouw rechten en onze verplichtingen onder de Europese privacywetgeving
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
                  <h2 className="text-xl font-semibold text-slate-800">Wat is GDPR?</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  De Algemene Verordening Gegevensbescherming (GDPR) is een Europese privacywet 
                  die de rechten van individuen beschermt met betrekking tot hun persoonlijke gegevens. 
                  Als web developer respecteer ik deze wetgeving volledig.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Jouw rechten onder GDPR</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Recht op toegang</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Je hebt het recht om te weten welke persoonlijke gegevens ik over je heb 
                      en hoe ik deze gebruik.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Recht op rectificatie</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Je kunt verzoeken om onjuiste of onvolledige gegevens te corrigeren 
                      of aan te vullen.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Recht op vergetelheid</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Je hebt het recht om je gegevens te laten verwijderen onder bepaalde 
                      omstandigheden.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Recht op beperking</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Je kunt verzoeken om de verwerking van je gegevens te beperken in 
                      bepaalde situaties.
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
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensverwerking</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Wettelijke grondslag</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Ik verwerk je gegevens op basis van toestemming, contractuitvoering 
                      of gerechtvaardigd belang, afhankelijk van de situatie.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Doel van verwerking</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Je gegevens worden alleen gebruikt voor het leveren van mijn diensten, 
                      communicatie en het verbeteren van mijn website.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Bewaarperiode</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Ik bewaar je gegevens niet langer dan noodzakelijk voor het doel 
                      waarvoor ze zijn verzameld.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensbeveiliging</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Ik neem passende technische en organisatorische maatregelen om je 
                  persoonlijke gegevens te beschermen tegen:
                </p>
                <div className="space-y-2">
                  {[
                    "Onbevoegde toegang of gebruik",
                    "Ongewenste wijziging of vernietiging",
                    "Onbevoegde openbaarmaking",
                    "Verlies of diefstal"
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
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensoverdracht</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Ik deel je gegevens alleen met derden wanneer dit:
                </p>
                <div className="space-y-2">
                  {[
                    "Noodzakelijk is voor het leveren van mijn diensten",
                    "Wettelijk verplicht is",
                    "Met je uitdrukkelijke toestemming gebeurt",
                    "Gebaseerd is op een gerechtvaardigd belang"
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
              <div className="bg-slate-50 border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Klachten en contact</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Als je vragen hebt over de verwerking van je gegevens of een klacht wilt 
                  indienen, kun je contact met me opnemen via het contactformulier.
                </p>
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Autoriteit Persoonsgegevens</h4>
                  <p className="text-slate-600 text-sm">
                    Je hebt ook het recht om een klacht in te dienen bij de Autoriteit 
                    Persoonsgegevens (AP) als je van mening bent dat je rechten worden geschonden.
                  </p>
                </div>
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
