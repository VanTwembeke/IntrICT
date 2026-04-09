'use client';

import { motion } from 'framer-motion';

interface Props {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ProjectCategories({ activeCategory, onCategoryChange }: Props) {
  const categories = [
    { id: 'all', name: 'Alle Projecten', count: 7 },
    { id: 'websites', name: 'Websites', count: 4 },
    { id: 'webapps', name: 'Web Apps', count: 2 },
    { id: 'ecommerce', name: 'E-commerce', count: 1 },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold md:text-5xl text-slate-800">
            Project Categorieën
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Filter mijn projecten op type om precies te vinden wat je zoekt
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.name}
              <span className="ml-2 text-sm opacity-75">({category.count})</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
