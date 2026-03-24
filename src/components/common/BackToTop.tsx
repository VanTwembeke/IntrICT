'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Only update if not currently scrolling to avoid flickering
      if (!isScrolling) {
        setIsVisible(window.pageYOffset > 300);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [isScrolling]);

  const scrollToTop = () => {
    setIsScrolling(true);
    
    const lenis = (window as any).lenis;
    
    // Try Lenis scroll if available
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { duration: 1 });
      // Reset scrolling state after animation
      setTimeout(() => setIsScrolling(false), 1000);
      return;
    }

    // Fallback to native smooth scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), 1000);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed p-4 text-white transition-all duration-300 rounded-full shadow-2xl bottom-8 right-8 z-60 bg-slate-800 hover:bg-slate-700 group"
          aria-label="Terug naar boven"
        >
          <motion.svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </motion.svg>
          <div className="absolute w-3 h-3 bg-green-500 rounded-full -top-2 -right-2 animate-pulse"></div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
