'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Process() {
  const { t } = useLanguage();
  const steps = t.process.steps.map((s, i) => ({ step: String(i + 1), ...s }));

  return (
    <section id="workflow" className="relative py-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Web development proces - Stap voor stap ontwikkeling"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80"></div>
        </div>
        <div className="relative z-10 py-16 md:py-24">
          <div className="max-w-6xl px-6 mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-6xl"
            >
              {t.process.heading}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto text-base leading-relaxed md:text-xl text-slate-200"
            >
              {t.process.subtitle}
            </motion.p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl px-4 py-16 mx-auto">
        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="space-y-6 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto text-2xl font-bold text-white rounded-full bg-slate-800">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{item.title}</h3>
              <p className="leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
