'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function Cookies() {
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
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Cookie beleid - Moderne web technologie en privacy"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                Cookiebeleid
              </h1>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Transparantie over cookies en jouw privacy voorkeuren
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
                  <h2 className="text-xl font-semibold text-slate-800">Wat zijn cookies?</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Cookies zijn kleine tekstbestanden die op je computer of mobiele apparaat worden 
                  opgeslagen wanneer je een website bezoekt. Ze helpen de website om je computer 
                  te herkennen en informatie over je voorkeuren op te slaan.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Welke cookies gebruik ik?</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Essentiële cookies</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Deze cookies zijn noodzakelijk voor het functioneren van de website. 
                      Ze kunnen niet worden uitgeschakeld en bevatten geen persoonlijke informatie.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Analytische cookies</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Ik gebruik Google Analytics om te begrijpen hoe bezoekers mijn website gebruiken. 
                      Deze cookies verzamelen anonieme informatie over je bezoek.
                    </p>
                  </div>
                  <div className="border-l-4 border-slate-300 pl-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Functionele cookies</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Deze cookies onthouden je voorkeuren en instellingen om je een betere 
                      gebruikerservaring te bieden.
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookie-instellingen</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Je kunt cookies beheren via je browserinstellingen. Houd er rekening mee dat 
                  het uitschakelen van bepaalde cookies de functionaliteit van de website kan beïnvloeden.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Browserinstellingen:</h4>
                  <div className="space-y-1">
                    {[
                      "Chrome: Instellingen → Privacy en beveiliging → Cookies",
                      "Firefox: Opties → Privacy en beveiliging → Cookies",
                      "Safari: Voorkeuren → Privacy → Cookies",
                      "Edge: Instellingen → Cookies en site-machtigingen"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-600 text-sm">{item}</span>
                      </div>
                    ))}
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookies van derden</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Mijn website kan cookies van derden bevatten, zoals:
                </p>
                <div className="space-y-2">
                  {[
                    "Google Analytics voor website-analyse",
                    "Social media platforms voor het delen van content",
                    "Hosting providers voor technische functionaliteit"
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookie-consent</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Door mijn website te gebruiken, geef je toestemming voor het gebruik van cookies 
                  zoals beschreven in dit beleid. Je kunt je toestemming op elk moment intrekken 
                  via je browserinstellingen.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-slate-50 border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Cookie Instellingen</h2>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 text-sm">
                  Je kunt je cookie voorkeuren op elk moment aanpassen. Klik op de knop hieronder 
                  om je instellingen te wijzigen.
                </p>
                <button 
                  onClick={() => {
                    // Clear existing consent to show popup again
                    localStorage.removeItem('cookie-consent');
                    window.location.reload();
                  }}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors duration-300"
                >
                  Cookie Instellingen Wijzigen
                </button>
              </div>
            </section>

            <section className="mb-12">
              <div className="bg-white border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">7</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Contact</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Voor vragen over dit cookiebeleid kun je contact met me opnemen via 
                  het contactformulier op mijn website.
                </p>
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
