'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Services() {
  const services = [
    {
      title: "Website Ontwikkeling",
      description: "Moderne, responsive websites die perfect werken op alle apparaten. Van eenvoudige landing pages tot complexe webapplicaties met de nieuwste technologieën.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Website ontwikkeling - Moderne web development",
      buttonText: "Meer over website ontwikkeling"
    },
    {
      title: "Logo & Branding",
      description: "Een uniek logo en sterke visuele identiteit die je bedrijf onderscheidt. Van concept tot definitieve ontwerpen die perfect passen bij je merk en doelgroep.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Logo & Branding - Visuele identiteit",
      buttonText: "Meer over logo & branding",
      reverse: true
    },
    {
      title: "Digitale Strategie",
      description: "Een complete digitale aanpak die je online aanwezigheid optimaliseert. Van SEO en analytics tot content strategie en gebruikerservaring.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Digitale strategie - Data en analytics",
      buttonText: "Meer over digitale strategie"
    },
    {
      title: "Technische Ondersteuning",
      description: "Hulp bij het opzetten en onderhouden van je digitale infrastructuur. Van hosting en domeinen tot beveiliging en performance optimalisatie.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      alt: "Technische ondersteuning - Server en hosting",
      buttonText: "Meer over technische ondersteuning",
      reverse: true
    }
  ];

  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-slate-800 text-center mb-16"
        >
          Mijn diensten
        </motion.h2>
        
        <div className="space-y-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className={`relative h-96 rounded-2xl overflow-hidden ${service.reverse ? 'order-1 md:order-2' : ''}`}>
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              </div>
              <div className={`space-y-6 ${service.reverse ? 'order-2 md:order-1' : ''}`}>
                <h3 className="text-4xl font-bold text-slate-800">{service.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {service.description}
                </p>
                <button className="bg-slate-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-700 transition-colors duration-300">
                  {service.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
