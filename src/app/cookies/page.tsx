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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Banner Section - Direct onder header */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Cookie beleid - Moderne web technologie en privacy"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">
                Cookiebeleid
              </h1>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
                Transparantie over cookies en jouw privacy voorkeuren
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
                  <h2 className="text-xl font-semibold text-slate-800">Wat zijn cookies?</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Cookies zijn kleine tekstbestanden die op je computer of mobiele apparaat worden 
                  opgeslagen wanneer je een website bezoekt. Ze helpen de website om je computer 
                  te herkennen en informatie over je voorkeuren op te slaan.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Welke cookies gebruik ik?</h2>
                </div>
                <div className="space-y-4">
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Essentiële cookies</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Deze cookies zijn noodzakelijk voor het functioneren van de website. 
                      Ze kunnen niet worden uitgeschakeld en bevatten geen persoonlijke informatie.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Analytische cookies</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ik gebruik Google Analytics om te begrijpen hoe bezoekers mijn website gebruiken. 
                      Deze cookies verzamelen anonieme informatie over je bezoek.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Functionele cookies</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Deze cookies onthouden je voorkeuren en instellingen om je een betere 
                      gebruikerservaring te bieden.
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookie-instellingen</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Je kunt cookies beheren via je browserinstellingen. Houd er rekening mee dat 
                  het uitschakelen van bepaalde cookies de functionaliteit van de website kan beïnvloeden.
                </p>
                <div className="p-4 rounded-lg bg-slate-50">
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">Browserinstellingen:</h4>
                  <div className="space-y-1">
                    {[
                      "Chrome: Instellingen → Privacy en beveiliging → Cookies",
                      "Firefox: Opties → Privacy en beveiliging → Cookies",
                      "Safari: Voorkeuren → Privacy → Cookies",
                      "Edge: Instellingen → Cookies en site-machtigingen"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                        <span className="text-sm text-slate-600">{item}</span>
                      </div>
                    ))}
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookies van derden</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Mijn website kan cookies van derden bevatten, zoals:
                </p>
                <div className="space-y-2">
                  {[
                    "Google Analytics voor website-analyse",
                    "Social media platforms voor het delen van content",
                    "Hosting providers voor technische functionaliteit"
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
                  <h2 className="text-xl font-semibold text-slate-800">Cookie-consent</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Door mijn website te gebruiken, geef je toestemming voor het gebruik van cookies 
                  zoals beschreven in dit beleid. Je kunt je toestemming op elk moment intrekken 
                  via je browserinstellingen.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 border bg-slate-50 border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Cookie Instellingen</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Je kunt je cookie voorkeuren op elk moment aanpassen. Klik op de knop hieronder 
                  om je instellingen te wijzigen.
                </p>
                <button 
                  onClick={() => {
                    // Clear existing consent to show popup again
                    localStorage.removeItem('cookie-consent');
                    window.location.reload();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors duration-300 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Cookie Instellingen Wijzigen
                </button>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">7</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Contact</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Voor vragen over dit cookiebeleid kun je contact met me opnemen via 
                  het contactformulier op mijn website.
                </p>
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
