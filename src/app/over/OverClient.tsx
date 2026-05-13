'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Over() {
  const { t } = useLanguage();
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const skills = [
    { name: 'React & Next.js', level: 95, color: 'from-blue-500 to-cyan-500' },
    { name: 'TypeScript', level: 90, color: 'from-blue-600 to-blue-800' },
    { name: 'Tailwind CSS', level: 95, color: 'from-teal-500 to-emerald-500' },
    { name: 'Node.js', level: 85, color: 'from-green-500 to-green-700' },
    { name: 'UI/UX Design', level: 88, color: 'from-purple-500 to-pink-500' },
    { name: 'SEO & Performance', level: 92, color: 'from-orange-500 to-red-500' },
  ];

  const values = t.about.values;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
          
          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                  {t.about.heading} <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">{t.about.headingHighlight}</span>
                </h1>
                <p className="max-w-2xl mb-8 text-xl leading-relaxed text-slate-200">
                  {t.about.subtitle}
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link href="/portfolio">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                    >
                      {t.about.cta2}
                    </motion.span>
                  </Link>
                  <Link href="/contact">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                    >
                      {t.about.cta1}
                    </motion.span>
                  </Link>
                </div>
              </motion.div>

              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative mx-auto w-80 h-80 lg:ml-auto">
                  <div className="absolute inset-0 transform bg-linear-to-br from-blue-500 to-purple-500 rounded-3xl rotate-3"></div>
                  <div className="relative w-full h-full overflow-hidden bg-white shadow-2xl rounded-3xl">
                    <Image
                      src="/images/Profiel.png"
                      alt="Profiel foto"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">{t.about.storyHeading}</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                {t.about.storySubtitle}
              </p>
            </motion.div>

            <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="p-8 border border-blue-100 bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <h3 className="mb-4 text-2xl font-bold text-slate-800">{t.about.storyCard1Title}</h3>
                  <p className="leading-relaxed text-slate-600">{t.about.storyCard1Body}</p>
                </div>
                <div className="p-8 border border-purple-100 bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <h3 className="mb-4 text-2xl font-bold text-slate-800">{t.about.storyCard2Title}</h3>
                  <p className="leading-relaxed text-slate-600">{t.about.storyCard2Body}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="p-8 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl space-y-4">
                  {[
                    { icon: '⚡', label: 'Antwoord binnen 24u op werkdagen' },
                    { icon: '🎯', label: 'Één vaste contactpersoon — altijd Jonas' },
                    { icon: '🔓', label: 'Gratis vrijblijvend kennismakingsgesprek' },
                    { icon: '🛠️', label: 'Moderne technologieën: Next.js, React, TypeScript' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-20 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">{t.about.skillsHeading}</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                {t.about.skillsSubtitle}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">{skill.name}</h3>
                    <span className="text-sm font-medium text-slate-600">{skill.level}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className={`h-3 rounded-full bg-linear-to-r ${skill.color}`}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">{t.about.valuesHeading}</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                {t.about.subtitle.split('.')[0]}.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 text-center transition-all duration-300 bg-linear-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-lg"
                >
                  <div className="mb-4 text-4xl">{value.icon}</div>
                  <h3 className="mb-4 text-xl font-bold text-slate-800">{value.title}</h3>
                  <p className="leading-relaxed text-slate-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">{t.about.ctaHeading}</span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                {t.about.ctaSubtitle}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  {t.about.ctaBtn1}
                </motion.a>
                <motion.a
                  href="/portfolio"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                >
                  {t.about.ctaBtn2}
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
