'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Smartphone, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  Shield, 
  FileText, 
  Code,
  Heart,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';

export default function Oplossingen() {
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
        {/* Banner Section */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Oplossingen - Gespecialiseerde web development oplossingen"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                Oplossingen
              </h1>
              <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Gespecialiseerde web development oplossingen voor jouw specifieke uitdagingen
              </p>
            </div>
          </div>
        </section>

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
                Gespecialiseerde Oplossingen
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Voor complexe digitale uitdagingen bied ik gespecialiseerde oplossingen 
                die verder gaan dan standaard web development.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                Van crypto-advies tot mini-apps, van technologische uitleg tot veiligheidsaudits - 
                ik help je met de digitale uitdagingen waar andere developers niet aan toekomen.
              </p>
            </div>
          </motion.div>

          {/* Hoofdoplossingen Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 mb-20"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Coins className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Crypto & Blockchain Advies</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Praktisch advies over cryptocurrency, blockchain technologie en digitale assets. 
                Geen technisch jargon, maar heldere uitleg over wat het voor jouw bedrijf kan betekenen.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Van wallet setup tot smart contracts, van NFT's tot DeFi - ik help je begrijpen 
                wat er mogelijk is en wat de risico's zijn.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Mini App Ontwikkeling</h3>
              <p className="text-slate-600 leading-relaxed text-lg mb-4">
                Kleine, gerichte applicaties die één specifiek probleem oplossen. 
                Snel te ontwikkelen, makkelijk te onderhouden en perfect voor specifieke workflows.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Van automatiseringstools tot data-verwerkingsscripts, van integraties tot 
                workflow-optimalisaties - soms is een kleine app precies wat je nodig hebt.
              </p>
            </div>
          </motion.div>

          {/* Gespecialiseerde Diensten */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-12">Gespecialiseerde Diensten</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Technologische Uitleg</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Complexe technologieën uitgelegd in gewone taal. Van AI tot blockchain, 
                    van cloud computing tot cybersecurity.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Trainingen & Workshops</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Praktische trainingen in digitale tools en applicaties. 
                    Van basis tot gevorderd, op maat voor jouw team.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Optimalisaties</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Bestaande systemen optimaliseren voor betere prestaties, 
                    gebruiksvriendelijkheid en efficiëntie.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">Veiligheid & Security</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Security audits, beveiligingsadvies en implementatie van 
                    best practices voor jouw digitale omgeving.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">GDPR & Compliance</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Hulp bij GDPR-compliance, privacy-richtlijnen en 
                    wettelijke verplichtingen voor jouw website of app.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Code className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-3">API Development</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Custom API's voor data-uitwisseling, integraties tussen systemen 
                    en automatisering van workflows.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Toegankelijke Web Development */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-8">Toegankelijke Web Development</h3>
              <div className="max-w-4xl mx-auto">
                <p className="text-xl text-slate-600 leading-relaxed mb-8 text-center">
                  Ik geloof dat iedereen toegang moet hebben tot een professionele online aanwezigheid, 
                  ongeacht het budget. Daarom bied ik speciale tarieven voor mensen die financieel minder sterk staan.
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <MessageCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Gratis Eerste Gesprek</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Elk project begint met een gratis, vrijblijvend gesprek. We bespreken jouw behoeften, 
                      mogelijkheden en budget. Geen verplichtingen, gewoon kennismaken.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-500 text-sm">
                        <strong>Wat we bespreken:</strong> Je doelen, budget, tijdlijn en wat er mogelijk is. 
                        Soms is een eenvoudige website precies wat je nodig hebt.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <Heart className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Flexibele Tarieven</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      Voor kleine websites en projecten kunnen we altijd een oplossing vinden die past bij jouw budget. 
                      Soms is een eenvoudige website precies wat je nodig hebt.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-slate-500 text-sm">
                        <strong>Mogelijkheden:</strong> Eenvoudige websites, portfolio's, contactpagina's, 
                        of kleine webapplicaties - alles bespreekbaar.
                      </p>
                    </div>
                  </div>
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
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Klaar voor een gesprek?</h3>
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl mx-auto">
                Of je nu een complexe technologische uitdaging hebt of gewoon een eenvoudige website nodig hebt - 
                laten we kennismaken en kijken wat er mogelijk is.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center space-x-3 bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-700 transition-colors duration-300"
              >
                <span>Gratis gesprek inplannen</span>
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
