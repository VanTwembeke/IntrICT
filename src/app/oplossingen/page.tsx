/* eslint-disable @next/next/no-html-link-for-pages */
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Banner Section */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Oplossingen - Gespecialiseerde web development oplossingen"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">
                Oplossingen
              </h1>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-200">
                Gespecialiseerde web development oplossingen voor jouw specifieke uitdagingen
              </p>
            </div>
          </div>
        </section>

        <div className="px-4 py-20 mx-auto max-w-7xl">
          
          {/* Intro Sectie */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="mb-8 text-4xl font-bold leading-tight md:text-5xl text-slate-800">
                Gespecialiseerde Oplossingen
              </h2>
              <p className="mb-8 text-xl leading-relaxed text-slate-600">
                Voor complexe digitale uitdagingen bied ik gespecialiseerde oplossingen 
                die verder gaan dan standaard web development.
              </p>
              <p className="text-lg leading-relaxed text-slate-500">
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
            className="grid gap-12 mb-20 lg:grid-cols-2"
          >
            <div className="p-10 border bg-slate-50 border-slate-200 rounded-2xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-slate-100">
                <Coins className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">Crypto & Blockchain Advies</h3>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                Praktisch advies over cryptocurrency, blockchain technologie en digitale assets. 
                Geen technisch jargon, maar heldere uitleg over wat het voor jouw bedrijf kan betekenen.
              </p>
              <p className="leading-relaxed text-slate-500">
                Van wallet setup tot smart contracts, van NFT&apos;s tot DeFi - ik help je begrijpen 
                wat er mogelijk is en wat de risico&apos;s zijn.
              </p>
            </div>

            <div className="p-10 border bg-slate-50 border-slate-200 rounded-2xl">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-lg bg-slate-100">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">Mini App Ontwikkeling</h3>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                Kleine, gerichte applicaties die één specifiek probleem oplossen. 
                Snel te ontwikkelen, makkelijk te onderhouden en perfect voor specifieke workflows.
              </p>
              <p className="leading-relaxed text-slate-500">
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
            <div className="p-12 bg-white border border-slate-200 rounded-2xl">
              <h3 className="mb-12 text-3xl font-bold text-center text-slate-800">Gespecialiseerde Diensten</h3>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <BookOpen className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">Technologische Uitleg</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Complexe technologieën uitgelegd in gewone taal. Van AI tot blockchain, 
                    van cloud computing tot cybersecurity.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <GraduationCap className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">Trainingen & Workshops</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Praktische trainingen in digitale tools en applicaties. 
                    Van basis tot gevorderd, op maat voor jouw team.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <Zap className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">Optimalisaties</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Bestaande systemen optimaliseren voor betere prestaties, 
                    gebruiksvriendelijkheid en efficiëntie.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <Shield className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">Veiligheid & Security</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Security audits, beveiligingsadvies en implementatie van 
                    best practices voor jouw digitale omgeving.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">GDPR & Compliance</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Hulp bij GDPR-compliance, privacy-richtlijnen en 
                    wettelijke verplichtingen voor jouw website of app.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-100">
                    <Code className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="mb-3 text-lg font-bold text-slate-800">API Development</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Custom API&apos;s voor data-uitwisseling, integraties tussen systemen 
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
            <div className="p-12 border bg-linear-to-br from-slate-50 to-slate-100 border-slate-200 rounded-2xl">
              <h3 className="mb-8 text-3xl font-bold text-center text-slate-800">Toegankelijke Web Development</h3>
              <div className="max-w-4xl mx-auto">
                <p className="mb-8 text-xl leading-relaxed text-center text-slate-600">
                  Ik geloof dat iedereen toegang moet hebben tot een professionele online aanwezigheid, 
                  ongeacht het budget. Daarom bied ik speciale tarieven voor mensen die financieel minder sterk staan.
                </p>
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-slate-100">
                        <MessageCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Gratis Eerste Gesprek</h4>
                    </div>
                    <p className="mb-4 leading-relaxed text-slate-600">
                      Elk project begint met een gratis, vrijblijvend gesprek. We bespreken jouw behoeften, 
                      mogelijkheden en budget. Geen verplichtingen, gewoon kennismaken.
                    </p>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500">
                        <strong>Wat we bespreken:</strong> Je doelen, budget, tijdlijn en wat er mogelijk is. 
                        Soms is een eenvoudige website precies wat je nodig hebt.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-lg bg-slate-100">
                        <Heart className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Flexibele Tarieven</h4>
                    </div>
                    <p className="mb-4 leading-relaxed text-slate-600">
                      Voor kleine websites en projecten kunnen we altijd een oplossing vinden die past bij jouw budget. 
                      Soms is een eenvoudige website precies wat je nodig hebt.
                    </p>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500">
                        <strong>Mogelijkheden:</strong> Eenvoudige websites, portfolio&apos;s, contactpagina&apos;s, 
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
            <div className="p-12 bg-white border border-slate-200 rounded-2xl">
              <h3 className="mb-6 text-3xl font-bold text-slate-800">Klaar voor een gesprek?</h3>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-600">
                Of je nu een complexe technologische uitdaging hebt of gewoon een eenvoudige website nodig hebt - 
                laten we kennismaken en kijken wat er mogelijk is.
              </p>
              <a 
                href="/#contact" 
                className="inline-flex items-center px-8 py-4 space-x-3 text-lg font-medium text-white transition-colors duration-300 bg-slate-800 rounded-xl hover:bg-slate-700"
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
