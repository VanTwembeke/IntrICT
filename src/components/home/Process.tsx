'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Process() {
  const steps = [
    { 
      step: "1", 
      title: "Consultatie & Planning", 
      desc: "We bespreken je wensen, doelgroep en doelen. Samen maken we een plan dat perfect aansluit bij jouw behoeften."
    },
    { 
      step: "2", 
      title: "Ontwikkeling & Design", 
      desc: "Ik bouw je website met moderne technologieën en best practices. Regelmatige updates houden je op de hoogte van de voortgang."
    },
    { 
      step: "3", 
      title: "Launch & Ondersteuning", 
      desc: "Je website gaat live en ik blijf beschikbaar voor ondersteuning, updates en verdere ontwikkeling."
    }
  ];

  return (
    <section id="workflow" className="relative py-20">
      <div className="relative overflow-hidden h-[340px] md:h-125">
        <Image
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Web development proces - Stap voor stap ontwikkeling"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-800/60 to-slate-900/80"></div>
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-6xl px-4 mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-5xl font-bold text-white md:text-7xl"
            >
              Het ontwikkelproces
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto text-xl leading-relaxed md:text-2xl text-slate-200"
            >
              Een gestructureerde aanpak die zorgt voor een website die perfect aansluit bij jouw behoeften
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
