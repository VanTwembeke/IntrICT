'use client';

import { motion } from 'framer-motion';

export default function Pricing() {
  const pricingPlans = [
    {
      name: "Basis Website",
      price: "€500",
      period: "eenmalig",
      description: "Perfect voor een eerste website",
      features: [
        "Eenvoudige website (3-5 pagina's)",
        "Responsive design",
        "Contact formulier",
        "Hosting setup",
        "2 weken ondersteuning"
      ],
      popular: false,
      cta: "Start project"
    },
    {
      name: "Complete Website",
      price: "€800",
      period: "eenmalig",
      description: "Meer functionaliteiten en pagina's",
      features: [
        "Website tot 8 pagina's",
        "Modern design",
        "Contact formulier",
        "Social media integratie",
        "Logo & branding",
        "1 maand ondersteuning"
      ],
      popular: true,
      cta: "Meest gekozen"
    },
    {
      name: "Custom Project",
      price: "€1.200",
      period: "eenmalig",
      description: "Voor speciale wensen en functionaliteiten",
      features: [
        "Website tot 15 pagina's",
        "Custom contact formulieren",
        "Social media integratie",
        "Google Analytics setup",
        "Hosting & domein configuratie",
        "2 maanden ondersteuning"
      ],
      popular: false,
      cta: "Bespreek wensen"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="px-4 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-5xl font-bold md:text-6xl text-slate-800">
            Mijn Tarieven
          </h2>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
            Eerlijke prijzen voor kwaliteitswerk. Geen verborgen kosten, gewoon duidelijke afspraken.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-slate-800 scale-105' : 'hover:shadow-2xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 py-2 text-sm font-semibold text-center text-white bg-slate-800">
                  Meest Gekozen
                </div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="mb-4 text-slate-600">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-800">{plan.price}</span>
                    <span className="ml-2 text-slate-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-12 text-center"
          >
            <h3 className="mb-4 text-4xl font-bold text-slate-800">
              Extra Ondersteuning
            </h3>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
              Na de ondersteuningsperiode kun je extra uren bij mij afnemen voor updates, 
              aanpassingen of nieuwe functionaliteiten.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              whileHover={{ y: -10 }}
              className="p-8 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="mb-4 text-5xl font-bold text-slate-800">€75</div>
                <div className="mb-6 text-xl text-slate-600">per uur</div>
                <h4 className="mb-4 text-xl font-bold text-slate-800">Standaard Tarief</h4>
                <p className="mb-6 text-slate-600">
                  Voor kleine aanpassingen en updates
                </p>
                <ul className="space-y-2 text-left text-slate-600">
                  <li>• Kleine aanpassingen</li>
                  <li>• Bug fixes</li>
                  <li>• Content updates</li>
                  <li>• Eenvoudige wijzigingen</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              whileHover={{ y: -10 }}
              className="p-8 transition-all duration-300 scale-105 bg-white shadow-lg rounded-2xl hover:shadow-2xl ring-2 ring-slate-800"
            >
              <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                <span className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-slate-800">
                  Meest Gekozen
                </span>
              </div>
              <div className="pt-4 text-center">
                <div className="mb-4 text-5xl font-bold text-slate-800">€60</div>
                <div className="mb-6 text-xl text-slate-600">per uur</div>
                <h4 className="mb-4 text-xl font-bold text-slate-800">Bij 5+ Uren</h4>
                <p className="mb-6 text-slate-600">
                  Korting bij 5 of meer uren per maand
                </p>
                <ul className="space-y-2 text-left text-slate-600">
                  <li>• Alle standaard werkzaamheden</li>
                  <li>• Nieuwe functionaliteiten</li>
                  <li>• Design aanpassingen</li>
                  <li>• Performance optimalisatie</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              whileHover={{ y: -10 }}
              className="p-8 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-2xl"
            >
              <div className="text-center">
                <div className="mb-4 text-5xl font-bold text-slate-800">€50</div>
                <div className="mb-6 text-xl text-slate-600">per uur</div>
                <h4 className="mb-4 text-xl font-bold text-slate-800">Bij 10+ Uren</h4>
                <p className="mb-6 text-slate-600">
                  Beste prijs bij 10 of meer uren per maand
                </p>
                <ul className="space-y-2 text-left text-slate-600">
                  <li>• Alle voorgaande werkzaamheden</li>
                  <li>• Complexe projecten</li>
                  <li>• Integraties</li>
                  <li>• Volledige ondersteuning</li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="mb-4 text-slate-600">
              Alle prijzen zijn exclusief BTW. Heb je andere wensen? 
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              className="font-semibold transition-colors duration-300 text-slate-800 hover:text-slate-600"
            >
              Laten we even praten →
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
