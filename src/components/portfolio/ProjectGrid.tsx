'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  activeCategory: string;
}

const projects = [
  {
    id: 1,
    title: 'IntrICT — Bedrijfswebsite',
    description:
      'Volledige company website gebouwd met Next.js, Tailwind CSS en Supabase. Inclusief contactformulier, blog, portfolio en een gebruikersdashboard met authenticatie.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'websites',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    liveUrl: 'https://intrict.com',
    githubUrl: null,
    featured: true,
  },
  {
    id: 2,
    title: 'Modern E-commerce Platform',
    description:
      'Volledig functioneel e-commerce platform met productbeheer, winkelwagen, betaling via Stripe en een admin-dashboard voor bestellingen en voorraad.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'ecommerce',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
  {
    id: 3,
    title: 'Corporate Website Redesign',
    description:
      'Volledig herontwerp van een bestaande bedrijfswebsite met focus op conversie, laadsnelheid en SEO. Resultaat: 40% meer leads na lancering.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'websites',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
  {
    id: 4,
    title: 'Task Management App',
    description:
      'Real-time taakbeheer applicatie met team-samenwerking, drag-and-drop interface, notificaties en gedetailleerde voortgangsrapportage.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'webapps',
    technologies: ['Vue.js', 'Firebase', 'Socket.io'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
  {
    id: 5,
    title: 'Restaurant Website',
    description:
      'Sfeervolle website voor een lokaal restaurant met online menukaart, reservatiesysteem en integratie met Google Reviews.',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'websites',
    technologies: ['React', 'Styled Components', 'Node.js'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
  {
    id: 6,
    title: 'Analytics Dashboard',
    description:
      'Interactief analytics dashboard met realtime datavizualisaties, exportfunctie en rolgebaseerde toegangscontrole voor een marketingteam.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'webapps',
    technologies: ['React', 'D3.js', 'Express', 'PostgreSQL'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
  {
    id: 7,
    title: 'Portfolio & Personal Brand',
    description:
      'Maatwerk portfolio website voor een freelance fotograaf met lightbox galerij, contactformulier en CMS-integratie voor eenvoudig beheer.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'websites',
    technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS'],
    liveUrl: '/contact',
    githubUrl: null,
    featured: false,
  },
];

export default function ProjectGrid({ activeCategory }: Props) {
  const { t } = useLanguage();
  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section className="py-20">
      <div className="px-4 mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                className={`overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-2xl ${
                  project.featured ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.featured && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500 text-white shadow">
                        {t.portfolio.featured}
                      </span>
                    )}
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-white/90 text-slate-800 capitalize">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-3 text-xl font-bold text-slate-800">{project.title}</h3>
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.a
                      href={project.liveUrl}
                      target={project.liveUrl.startsWith('http') ? '_blank' : undefined}
                      rel={project.liveUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="flex-1 px-4 py-2.5 font-semibold text-center text-white text-sm transition-colors duration-300 rounded-xl bg-slate-800 hover:bg-slate-700"
                    >
                      {project.liveUrl.startsWith('http') ? t.portfolio.viewLive : t.portfolio.moreInfo}
                    </motion.a>
                    {project.githubUrl ? (
                      <motion.a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex-1 px-4 py-2.5 font-semibold text-center text-sm transition-colors duration-300 border rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        GitHub
                      </motion.a>
                    ) : (
                      <motion.a
                        href="/contact"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex-1 px-4 py-2.5 font-semibold text-center text-sm transition-colors duration-300 border rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {t.portfolio.requestQuote}
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-lg text-slate-500">{t.portfolio.noProjectsFound}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
