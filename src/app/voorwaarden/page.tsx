/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function Voorwaarden() {
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
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Algemene voorwaarden - Professionele samenwerking en transparantie"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">
                Algemene Voorwaarden
              </h1>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
                Duidelijke afspraken en transparante voorwaarden voor onze samenwerking
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
                  <h2 className="text-xl font-semibold text-slate-800">Algemene bepalingen</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Deze algemene voorwaarden zijn van toepassing op alle diensten die ik als web developer 
                  verleen. Door gebruik te maken van mijn diensten, ga je akkoord met deze voorwaarden.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Diensten</h2>
                </div>
                <div className="space-y-4">
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Website ontwikkeling</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ik lever websites op maat volgens de afgesproken specificaties. De exacte 
                      functionaliteiten en deliverables worden vooraf vastgelegd in een projectplan.
                    </p>
                  </div>
                  <div className="pl-4 border-l-4 border-slate-300">
                    <h3 className="mb-1 text-sm font-semibold text-slate-800">Ondersteuning</h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Na oplevering bied ik ondersteuning volgens de afgesproken voorwaarden. 
                      Extra werkzaamheden worden in overleg uitgevoerd tegen het geldende uurtarief.
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
                  <h2 className="text-xl font-semibold text-slate-800">Prijzen en betaling</h2>
                </div>
                <div className="space-y-2">
                  {[
                    "Alle prijzen zijn exclusief BTW, tenzij anders vermeld",
                    "Betaling geschiedt volgens de afgesproken voorwaarden",
                    "Bij vertraging in betaling kan ik rente in rekening brengen",
                    "Extra werkzaamheden worden vooraf gemeld en goedgekeurd"
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
                  <h2 className="text-xl font-semibold text-slate-800">Levering en oplevering</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Ik streef ernaar projecten binnen de afgesproken termijn op te leveren. 
                  Vertragingen door omstandigheden buiten mijn controle kunnen leiden tot 
                  aanpassing van de leveringsdatum.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 bg-white border border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">5</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Aansprakelijkheid</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  Mijn aansprakelijkheid is beperkt tot de waarde van het betreffende project. 
                  Ik ben niet aansprakelijk voor indirecte schade of gevolgschade.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <div className="p-6 border bg-slate-50 border-slate-200">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                    <span className="text-sm font-semibold text-white">6</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Intellectueel eigendom</h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  Na volledige betaling van het project worden alle rechten op de ontwikkelde 
                  website overgedragen aan de opdrachtgever. Ik behoud het recht om mijn 
                  werk te tonen in mijn portfolio.
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
