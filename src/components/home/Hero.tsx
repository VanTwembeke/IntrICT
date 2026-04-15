'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Web development - Moderne code en technologie"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 text-6xl font-bold leading-tight text-white md:text-8xl"
          >
            Moderne websites die werken
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-12 text-xl leading-relaxed md:text-2xl text-slate-200"
          >
            Van concept tot live website. Ik help je met moderne webontwikkeling, logo&apos;s en digitale strategie
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col justify-center gap-6 sm:flex-row"
          >
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-12 py-4 text-lg font-semibold transition-all duration-300 bg-white rounded-full shadow-2xl text-slate-800 hover:bg-slate-100"
            >
              Start je project
            </motion.a>
            <motion.a
              href="/portfolio"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-12 py-4 text-lg font-semibold text-white transition-all duration-300 border-2 border-white rounded-full hover:bg-white hover:text-slate-800"
            >
              Bekijk mijn werk
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
