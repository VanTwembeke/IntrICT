'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Approach() {
  const approaches = [
    { 
      title: "Strategie & Planning", 
      desc: "We beginnen met een grondige analyse van je doelen en doelgroep. Samen bepalen we de beste aanpak voor jouw project." 
    },
    { 
      title: "Design & Ontwikkeling", 
      desc: "Van wireframes tot volledige implementatie. Ik gebruik de nieuwste technologieën en best practices voor optimale resultaten." 
    },
    { 
      title: "Launch & Ondersteuning", 
      desc: "Na de lancering blijf ik beschikbaar voor ondersteuning en updates. Je website groeit mee met je bedrijf." 
    }
  ];

  return (
    <section id="about" className="relative py-20">
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Web development werkwijze - Moderne technologie en processen"
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
              Mijn werkwijze
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto text-xl leading-relaxed md:text-2xl text-slate-200"
            >
              Van concept tot live website. Ik begeleid je door het hele proces met moderne tools en technieken
            </motion.p>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl px-4 py-16 mx-auto">
        <div className="grid gap-12 md:grid-cols-3">
          {approaches.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="space-y-4 text-center"
            >
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
