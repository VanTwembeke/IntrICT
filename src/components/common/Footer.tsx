'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const footerLinks = {
    company: [
      { name: 'Over Mij', href: '#over-mij' },
      { name: 'Mijn Werk', href: '#portfolio' },
      { name: 'Proces', href: '#proces' },
      { name: 'Ervaring', href: '#ervaring' },
    ],
    services: [
      { name: 'Websites', href: '#website-ontwikkeling' },
      { name: 'Logo & Branding', href: '#logo-branding' },
      { name: 'Digitale Strategie', href: '#digitale-strategie' },
      { name: 'Ondersteuning', href: '#technische-ondersteuning' },
    ],
    resources: [
      { name: 'Portfolio', href: '#portfolio' },
      { name: 'Blog', href: '#blog' },
      { name: 'Tips', href: '#tips' },
      { name: 'Resources', href: '#resources' },
    ],
    legal: [
      { name: 'Privacybeleid', href: '/privacy' },
      { name: 'Algemene Voorwaarden', href: '/voorwaarden' },
      { name: 'Cookiebeleid', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  };

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
        </svg>
      ),
    },
  ];

          return (
            <footer className="relative border-t bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 md:gap-12">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-slate-800 md:text-xl">IntrICT</span>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-slate-600 md:text-base">
                  Moderne web development van concept tot live website. Ik help je met responsive websites, 
                  logo's, branding en complete digitale strategieën voor je bedrijf.
                </p>
                <div className="flex space-x-3 md:space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="p-2 transition-all duration-300 rounded-lg bg-slate-100 md:p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Company Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-slate-800 md:text-base md:mb-6">
                  Over Mij
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="block px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
                      >
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Services Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-slate-800">
                  Diensten
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {footerLinks.services.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="block px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
                      >
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Resources Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-slate-800">
                  Inzichten
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="block px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
                      >
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        {isMounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="py-6 border-t md:py-8 border-slate-200"
          >
            <div className="max-w-md px-4 mx-auto text-center">
              <h3 className="mb-3 text-lg font-bold text-slate-800 md:text-xl md:mb-4">
                Blijf Op de Hoogte
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-600 md:text-base md:mb-6">
                Ontvang tips en updates over web development, design en digitale strategie.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Voer uw e-mailadres in"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-dashlane-ignore="true"
                  className="flex-1 px-3 py-2 text-sm transition-all duration-300 bg-white border rounded-lg md:px-4 md:py-3 border-slate-300 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-400 md:text-base"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-dashlane-ignore="true"
                  className="px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg bg-slate-800 md:px-6 md:py-3 hover:bg-slate-700 md:text-base"
                >
                  Aanmelden
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="py-6 border-t md:py-8 border-slate-200"
        >
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm font-medium text-center text-slate-600 md:text-base md:text-left">
              © {currentYear} IntrICT. Alle rechten voorbehouden.
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end md:gap-4">
              {footerLinks.legal.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                  className="px-2 py-1 text-xs font-medium transition-all duration-300 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 md:px-3 md:py-2 md:text-sm"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
