'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function CallToAction() {
  return (
    <section className="relative py-20">
      <div className="relative overflow-hidden h-96 md:h-125">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Contact - Laten we samenwerken"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80"></div>
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-6xl px-4 mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 text-5xl font-bold text-white md:text-7xl"
            >
              Klaar voor je volgende project?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-12 text-xl leading-relaxed md:text-2xl text-slate-200"
            >
              Laten we samenwerken aan iets geweldigs. Van concept tot lancering, 
              ik help je bij elke stap van het proces.
            </motion.p>
            <div className="flex flex-col justify-center gap-6 sm:flex-row">
              <motion.a
                href="/contact"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-12 py-4 text-lg font-semibold transition-all duration-300 bg-white rounded-full shadow-2xl text-slate-800 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Start je project
              </motion.a>
              <motion.a
                href="mailto:info@intrict.com"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 px-12 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 border-white rounded-full hover:bg-white hover:text-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Neem contact op
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




