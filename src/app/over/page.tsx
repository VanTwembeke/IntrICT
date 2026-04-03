'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { Link } from 'lucide-react';

export default function Over() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  const skills = [
    { name: 'React & Next.js', level: 95, color: 'from-blue-500 to-cyan-500' },
    { name: 'TypeScript', level: 90, color: 'from-blue-600 to-blue-800' },
    { name: 'Tailwind CSS', level: 95, color: 'from-teal-500 to-emerald-500' },
    { name: 'Node.js', level: 85, color: 'from-green-500 to-green-700' },
    { name: 'UI/UX Design', level: 88, color: 'from-purple-500 to-pink-500' },
    { name: 'SEO & Performance', level: 92, color: 'from-orange-500 to-red-500' },
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Focus op Kwaliteit',
      description: 'Elk project krijgt mijn volledige aandacht voor de beste resultaten.'
    },
    {
      icon: '🚀',
      title: 'Innovatie',
      description: 'Altijd op zoek naar de nieuwste technologieën en best practices.'
    },
    {
      icon: '🤝',
      title: 'Samenwerking',
      description: 'Ik werk graag samen met mijn klanten om hun visie te realiseren.'
    },
    {
      icon: '⚡',
      title: 'Performance',
      description: 'Snelle, geoptimaliseerde websites die perfect werken op alle apparaten.'
    }
  ];

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
                  Over <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Mij</span>
                </h1>
                <p className="max-w-2xl mb-8 text-xl leading-relaxed text-slate-200">
                  Ik ben een gepassioneerde web developer die digitale ervaringen creëert die écht impact hebben. 
                  Met een achtergrond in zowel techniek als design, help ik bedrijven hun online aanwezigheid naar het volgende niveau te tillen.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                  >
                    Bekijk Mijn Portfolio
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                  >
                    Neem Contact Op
                  </motion.button>
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
                Mijn <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Verhaal</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                Van nieuwsgierigheid naar code tot het creëren van digitale meesterwerken
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
                  <h3 className="mb-4 text-2xl font-bold text-slate-800">Het Begin</h3>
                  <p className="leading-relaxed text-slate-600">
                    Mijn reis begon met een simpele vraag: &quot;Hoe werken websites eigenlijk?&quot; 
                    Die nieuwsgierigheid leidde tot uren van experimenteren met HTML en CSS, 
                    en uiteindelijk tot een diepe passie voor code en web development.
                  </p>
                </div>
                <div className="p-8 border border-purple-100 bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <h3 className="mb-4 text-2xl font-bold text-slate-800">De Groei</h3>
                  <p className="leading-relaxed text-slate-600">
                    Door de jaren heen heb ik me gespecialiseerd in moderne technologieën zoals React, 
                    Next.js en TypeScript. Maar wat me echt onderscheidt is mijn focus op gebruikerservaring 
                    en performance.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="p-8 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-blue-600">5+</div>
                      <div className="text-sm text-slate-600">Jaar Ervaring</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-purple-600">1+</div>
                      <div className="text-sm text-slate-600">Projecten</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-slate-600">Tevreden Klanten</div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 text-3xl font-bold text-orange-600">24/7</div>
                      <div className="text-sm text-slate-600">Support</div>
                    </div>
                  </div>
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
                Mijn <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Expertise</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                Moderne technologieën en best practices voor de beste resultaten
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
                Mijn <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Waarden</span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl leading-relaxed text-slate-600">
                De principes die mijn werk en aanpak sturen
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
                Laten We Samen <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Werken</span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Klaar om je project naar het volgende niveau te tillen? Laten we kennismaken en 
                bespreken hoe ik je kan helpen met jouw digitale ambities.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  Start Je Project
                </motion.button>
                </Link>
                <Link href="/portfolio">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                >
                  Bekijk Portfolio
                </motion.button>
                </Link>
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
