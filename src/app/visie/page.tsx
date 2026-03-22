'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function Visie() {
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
        {/* Hero Section */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Visie - Samenwerking en klantresultaat"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80"></div>
          
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-bold text-white mb-6"
              >
                Mijn Visie
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed"
              >
                Hoe ik technologie gebruik om jouw doelen te bereiken en problemen op te lossen
              </motion.p>
            </div>
          </div>
        </section>

        {/* Visie Inhoud */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          
          {/* Intro Sectie */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 leading-tight">
                Mijn visie op web development
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Het gaat niet om de nieuwste technologie of de mooiste code. Het gaat om het resultaat dat jij wilt bereiken 
                en hoe ik je daarbij kan helpen. Simpel, effectief en menselijk - dat is mijn aanpak.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                Ik zie elke website als een kans om iemands dag beter te maken. Of het nu gaat om een eenvoudige 
                contactpagina of een complexe webapplicatie - het eindresultaat moet altijd waarde toevoegen aan 
                het leven van de mensen die het gebruiken.
              </p>
            </div>
          </motion.div>

          {/* Visie Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-10"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-slate-600 text-xl">→</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Resultaat over techniek</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Jij wilt een website die werkt en je helpt je doelen te bereiken. Ik focus op wat jij nodig hebt, 
                niet op wat technisch mogelijk is. Praktisch en effectief, dat is wat telt.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Ik kies bewust voor bewezen technologieën die betrouwbaar zijn, in plaats van de nieuwste hype. 
                Een website die vandaag werkt, moet ook over vijf jaar nog steeds goed functioneren. 
                Duurzaamheid en stabiliteit zijn belangrijker dan indruk maken met de laatste trends.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-10"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-slate-600 text-xl">+</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Echte samenwerking</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Ik geloof in echte samenwerking. Jij kent je bedrijf en doelen, ik ken de techniek. 
                Samen maken we iets dat jij zelf niet had kunnen maken, maar precies is wat je nodig hebt.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Tijdens het hele proces werk ik graag samen met je. Regelmatige updates, feedback en 
                aanpassingen zorgen ervoor dat het eindresultaat precies is wat je wilde. Ik zie mezelf 
                niet als een externe leverancier, maar als een onderdeel van jouw team.
              </p>
            </motion.div>
          </div>

          {/* Mijn Aanpak Sectie */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-12">Waarom ik anders werk</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-slate-600 text-lg">•</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Eerst luisteren</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Ik begin niet meteen met oplossingen bedenken. Eerst luister ik naar jouw verhaal, 
                    je uitdagingen en je doelen. Alleen door jouw situatie echt te begrijpen, kan ik 
                    de juiste oplossing maken.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-slate-600 text-lg">•</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Focus op waarde</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Elke functie die ik toevoeg, elke keuze die ik maak, moet écht waarde toevoegen 
                    voor jouw gebruikers. Geen overbodige features, geen complexiteit waar het niet nodig is.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <span className="text-slate-600 text-lg">•</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Iteratief werken</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Ik werk in kleine stappen en test regelmatig. Zo kunnen we tussentijds bijsturen 
                    en zorgen we ervoor dat het eindresultaat precies is wat je wilde.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Werkwijze Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h3 className="text-3xl font-bold text-slate-800 text-center mb-16">Hoe ik te werk ga</h3>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-300 rounded-full"></div>
              
              <div className="space-y-16">
                <div className="flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                      <div className="flex items-center justify-end mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg mr-4">1</div>
                        <h4 className="text-xl font-bold text-slate-800">Luisteren</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        Ik begin altijd met goed luisteren naar jouw verhaal. Wat wil je bereiken? 
                        Wat zijn je uitdagingen? Alleen door jouw situatie te begrijpen kan ik de juiste oplossing maken.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-500 text-sm">
                          <strong>Wat ik wil weten:</strong> Je doelgroep, je huidige uitdagingen, 
                          je budget en tijdlijn, en wat je al hebt geprobeerd.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-slate-300 rounded-full border-4 border-white shadow-lg z-10"></div>
                  <div className="w-1/2 pl-8"></div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 pr-8"></div>
                  <div className="w-8 h-8 bg-slate-300 rounded-full border-4 border-white shadow-lg z-10"></div>
                  <div className="w-1/2 pl-8">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                      <div className="flex items-center mb-4">
                        <h4 className="text-xl font-bold text-slate-800 mr-4">Oplossen</h4>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg">2</div>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        Geen over-engineered systemen, maar slimme oplossingen die gewoon werken. 
                        Ik kies de technologie die het beste past bij jouw behoeften en budget.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-500 text-sm">
                          <strong>Mijn aanpak:</strong> Eenvoudige, bewezen technologieën die betrouwbaar zijn. 
                          Geen experimenten op jouw kosten, maar oplossingen die gewoon werken.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/2 pr-8 text-right">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                      <div className="flex items-center justify-end mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg mr-4">3</div>
                        <h4 className="text-xl font-bold text-slate-800">Samenwerken</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        Ik werk graag samen met je tijdens het hele proces. Regelmatige updates, feedback 
                        en aanpassingen zorgen ervoor dat het eindresultaat precies is wat je wilde.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-500 text-sm">
                          <strong>Hoe we samenwerken:</strong> Wekelijkse updates, tussentijdse feedback momenten, 
                          en de mogelijkheid om tussentijds bij te sturen. Jij blijft eigenaar van het proces.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-slate-300 rounded-full border-4 border-white shadow-lg z-10"></div>
                  <div className="w-1/2 pl-8"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Waarden Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-slate-600 text-lg">•</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">Duidelijke communicatie</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Geen technisch jargon, maar heldere uitleg in gewone taal.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-slate-600 text-lg">•</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">Snelle resultaten</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Geen maanden wachten, maar concrete voortgang in duidelijke stappen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-slate-600 text-lg">•</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">Praktische oplossingen</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Slimme oplossingen die gewoon werken, geen over-engineered systemen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-slate-600 text-lg">•</span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">Leren door doen</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Elk project leert me iets nieuws en maakt me beter in wat ik doe.
              </p>
            </div>
          </motion.div>

          {/* Wat maakt mij anders sectie */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-12">Wat maakt mij anders</h3>
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Geen technisch jargon</h4>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Ik spreek gewoon Nederlands. Geen moeilijke termen, geen verwarrende uitleg. 
                    Als ik iets uitleg, begrijp je het meteen. Dat is belangrijk voor een goede samenwerking.
                  </p>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Transparantie in alles</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Je weet altijd waar je aan toe bent. Duidelijke prijzen, realistische tijdlijnen, 
                    en eerlijke communicatie over wat wel en niet mogelijk is. Geen verrassingen.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Focus op jouw succes</h4>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Mijn succes is jouw succes. Als jouw website goed presteert, ben ik tevreden. 
                    Ik investeer in lange termijn relaties, niet in snelle projecten.
                  </p>
                  <h4 className="text-xl font-bold text-slate-800 mb-4">Praktische ervaring</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Ik heb zelf websites gebouwd en onderhouden. Ik weet wat er mis kan gaan, 
                    wat gebruikers echt willen, en hoe je problemen voorkomt voordat ze ontstaan.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Klaar om samen te werken?</h3>
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl mx-auto">
                Als mijn visie en aanpak je aanspreken, dan zou ik graag kennismaken. 
                Laten we een kop koffie drinken en kijken hoe ik je kan helpen.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center space-x-3 bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-700 transition-colors duration-300"
              >
                <span>Laten we kennismaken</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
