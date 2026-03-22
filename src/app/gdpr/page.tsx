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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Banner Section - Direct onder header */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="GDPR compliance - Europese privacywetgeving en gegevensbescherming"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">
                GDPR Informatie
              </h1>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
                Jouw rechten en onze verplichtingen onder de Europese privacywetgeving
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
                  <h2 className="text-xl font-semibold text-slate-800">Wat is GDPR?</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  De Algemene Verordening Gegevensbescherming (GDPR) is een Europese privacywet 
                  die de rechten van individuen beschermt met betrekking tot hun persoonlijke gegevens. 
                  Als web developer respecteer ik deze wetgeving volledig.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Jouw rechten onder GDPR</h2>
                </div>
                <div className="space-y-4">
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Recht op toegang</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Je hebt het recht om te weten welke persoonlijke gegevens ik over je heb 
                      en hoe ik deze gebruik.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Recht op rectificatie</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Je kunt verzoeken om onjuiste of onvolledige gegevens te corrigeren 
                      of aan te vullen.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Recht op vergetelheid</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Je hebt het recht om je gegevens te laten verwijderen onder bepaalde 
                      omstandigheden.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Recht op beperking</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Je kunt verzoeken om de verwerking van je gegevens te beperken in 
                      bepaalde situaties.
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
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensverwerking</h2>
                </div>
                <div className="space-y-4">
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Wettelijke grondslag</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ik verwerk je gegevens op basis van toestemming, contractuitvoering 
                      of gerechtvaardigd belang, afhankelijk van de situatie.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Doel van verwerking</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Je gegevens worden alleen gebruikt voor het leveren van mijn diensten, 
                      communicatie en het verbeteren van mijn website.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Bewaarperiode</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ik bewaar je gegevens niet langer dan noodzakelijk voor het doel 
                      waarvoor ze zijn verzameld.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensbeveiliging</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
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
                  <h2 className="text-xl font-semibold text-slate-800">Gegevensoverdracht</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
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
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                      <span className="text-sm text-slate-600">{item}</span>
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
                  <h2 className="text-xl font-semibold text-slate-800">Klachten en contact</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Als je vragen hebt over de verwerking van je gegevens of een klacht wilt 
                  indienen, kun je contact met me opnemen via het contactformulier.
                </p>
                <div className="p-4 rounded-lg bg-slate-100">
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">Autoriteit Persoonsgegevens</h4>
                  <p className="text-sm text-slate-600">
                    Je hebt ook het recht om een klacht in te dienen bij de Autoriteit 
                    Persoonsgegevens (AP) als je van mening bent dat je rechten worden geschonden.
                  </p>
                </div>
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
