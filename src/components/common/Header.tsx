/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
            <motion.header
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                  ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg'
                  : 'bg-black/20 backdrop-blur-sm'
              }`}
            >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <span className={`font-semibold text-lg transition-colors duration-300 ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`}>IntrICT</span>
          </motion.a>

          {/* Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            {/* Homepage Subnav */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`transition-colors duration-200 flex items-center space-x-2 ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-slate-800' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <span className="font-semibold">Home</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 z-50 invisible w-56 mt-3 transition-all duration-300 transform translate-y-2 border shadow-2xl opacity-0 top-full bg-white/95 backdrop-blur-md rounded-xl border-slate-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                <div className="py-3">
                  <motion.a
                    href="/#services"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Diensten</span>
                  </motion.a>
                  <motion.a
                    href="/#workflow"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Proces</span>
                  </motion.a>
                  <motion.a
                    href="/#contact"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contact</span>
                  </motion.a>
                </div>
              </div>
            </div>
            
            <motion.a
              href="/portfolio"
              whileHover={{ scale: 1.05 }}
              className={`transition-colors duration-200 ${
                isScrolled 
                  ? 'text-slate-600 hover:text-slate-800' 
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Portfolio
            </motion.a>
            
            <motion.a
              href="/blog"
              whileHover={{ scale: 1.05 }}
              className={`transition-colors duration-200 ${
                isScrolled 
                  ? 'text-slate-600 hover:text-slate-800' 
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Blog
            </motion.a>
            
            <motion.a
              href="/oplossingen"
              whileHover={{ scale: 1.05 }}
              className={`transition-colors duration-200 ${
                isScrolled 
                  ? 'text-slate-600 hover:text-slate-800' 
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              Oplossingen
            </motion.a>
            
            {/* Info Subnav - Aan het einde */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`transition-colors duration-200 flex items-center space-x-2 ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-slate-800' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <span className="font-semibold">Info</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>
              
              {/* Info Dropdown Menu */}
              <div className="absolute left-0 z-50 invisible w-48 mt-3 transition-all duration-300 transform translate-y-2 border shadow-2xl opacity-0 top-full bg-white/95 backdrop-blur-md rounded-xl border-slate-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                <div className="py-3">
                  <motion.a
                    href="/visie"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-green-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Visie</span>
                  </motion.a>
                  <motion.a
                    href="/over"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-green-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Over</span>
                  </motion.a>
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center px-4 py-3 transition-all duration-200 text-slate-700 hover:bg-linear-to-r hover:from-slate-50 hover:to-green-50 hover:text-slate-900 group"
                  >
                    <svg className="w-4 h-4 mr-3 transition-colors duration-200 text-slate-500 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contact</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </nav>

          {/* CTA Button */}
          <motion.button
            onClick={() => router.push('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              isScrolled 
                ? 'bg-slate-800 text-white hover:bg-slate-700' 
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            Log In
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg md:hidden glass-card"
          >
            <svg
              className={`w-6 h-6 transition-colors duration-300 ${
                isScrolled ? 'text-slate-600' : 'text-white'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-b border-gray-200 shadow-lg md:hidden bg-white/95 backdrop-blur-md"
        >
          <div className="px-4 py-6 space-y-4">
            {/* Home Section */}
            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-slate-800">
                Home
              </h3>
              <div className="ml-4 space-y-2">
                <a href="/#services" className="block py-2 text-slate-600 hover:text-slate-800">
                  Diensten
                </a>
                <a href="/#about" className="block py-2 text-slate-600 hover:text-slate-800">
                  Werkwijze
                </a>
                <a href="/#workflow" className="block py-2 text-slate-600 hover:text-slate-800">
                  Proces
                </a>
                <a href="/#contact" className="block py-2 text-slate-600 hover:text-slate-800">
                  Contact
                </a>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="space-y-2">
              <a href="/portfolio" className="block py-2 font-semibold text-slate-800 hover:text-slate-600">
                Portfolio
              </a>
              <a href="/blog" className="block py-2 font-semibold text-slate-800 hover:text-slate-600">
                Blog
              </a>
              <a href="/oplossingen" className="block py-2 font-semibold text-slate-800 hover:text-slate-600">
                Oplossingen
              </a>
            </div>

            {/* Info Section */}
            <div>
              <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-slate-800">
                Info
              </h3>
              <div className="ml-4 space-y-2">
                <a href="/visie" className="block py-2 text-slate-600 hover:text-slate-800">
                  Visie
                </a>
                <a href="/over" className="block py-2 text-slate-600 hover:text-slate-800">
                  Over
                </a>
              <a href="/contact" className="block py-2 text-slate-600 hover:text-slate-800">
                Contact
              </a>
            </div>
          </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button onClick={() => router.push('/login')} className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 rounded-lg bg-slate-800 hover:bg-slate-700">
                Log In
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
