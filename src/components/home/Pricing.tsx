'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Pricing() {
  const { t } = useLanguage();
  const { plans, support } = t.pricing;

  const prices = ['€99', '€199', '€399'];
  const popular = [false, true, false];

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
            {t.pricing.heading}
          </h2>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
            {t.pricing.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                popular[index] ? 'ring-2 ring-slate-800 scale-105' : 'hover:shadow-2xl'
              }`}
            >
              {popular[index] && (
                <div className="absolute top-0 left-0 right-0 py-2 text-sm font-semibold text-center text-white bg-slate-800">
                  {t.pricing.mostChosen}
                </div>
              )}

              <div className={`p-8 ${popular[index] ? 'pt-16' : ''}`}>
                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-slate-800">{plan.name}</h3>
                  <p className="mb-4 text-slate-600">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-800">{prices[index]}</span>
                    <span className="ml-2 text-slate-600">{t.pricing.period}</span>
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
                    popular[index]
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {popular[index] ? t.pricing.mostChosen : index === 0 ? t.pricing.startProject : t.pricing.talkWishes}
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
              {support.heading}
            </h3>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
              {support.subtitle}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {support.tiers.map((tier, i) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 + i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`p-8 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-2xl ${
                  i === 1 ? 'relative scale-105 ring-2 ring-slate-800' : ''
                }`}
              >
                {i === 1 && (
                  <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                    <span className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-slate-800">
                      {support.mostChosen}
                    </span>
                  </div>
                )}
                <div className={`text-center ${i === 1 ? 'pt-4' : ''}`}>
                  <div className="mb-4 text-5xl font-bold text-slate-800">{tier.price}</div>
                  <div className="mb-6 text-xl text-slate-600">{t.pricing.perHour}</div>
                  <h4 className="mb-4 text-xl font-bold text-slate-800">{tier.title}</h4>
                  <p className="mb-6 text-slate-600">{tier.desc}</p>
                  <ul className="space-y-2 text-left text-slate-600">
                    {tier.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="mb-4 text-slate-600">
              {support.vatNote}
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              className="font-semibold transition-colors duration-300 text-slate-800 hover:text-slate-600"
            >
              {support.talkLink}
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
