'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const SERVICE_IMAGES = [
  { image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", href: "/blog/website-ontwikkeling", reverse: false },
  { image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", href: "/blog/logo-en-branding", reverse: true },
  { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", href: "/blog/digitale-strategie", reverse: false },
];

export default function Services() {
  const { t } = useLanguage();
  const services = t.services.items.map((item, i) => ({
    ...item,
    ...SERVICE_IMAGES[i],
    alt: item.title,
  }));

  return (
    <section id="services" className="py-20">
      <div className="px-4 mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-5xl font-bold text-center md:text-6xl text-slate-800"
        >
          {t.services.heading}
        </motion.h2>
        
        <div className="space-y-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid items-center gap-12 md:grid-cols-2"
            >
              <div className={`relative h-96 rounded-2xl overflow-hidden ${service.reverse ? 'order-1 md:order-2' : ''}`}>
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent"></div>
              </div>
              <div className={`space-y-6 ${service.reverse ? 'order-2 md:order-1' : ''}`}>
                <h3 className="text-4xl font-bold text-slate-800">{service.title}</h3>
                <p className="text-lg leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <Link href={service.href}>
                  <span className="inline-block px-8 py-3 font-semibold text-white transition-colors duration-300 rounded-full cursor-pointer bg-slate-800 hover:bg-slate-700">
                   {service.buttonText}
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
