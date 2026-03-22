'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Settings, Shield, Cookie, Eye } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000); // Show after 2 seconds
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  if (!isVisible && !showSettings) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="max-w-4xl mx-4 mx-auto mb-20 border-t shadow-lg bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-xl">
          <div className="px-4 py-2">
          {!showSettings ? (
            <div className="flex items-center justify-between">
              {/* Left side - Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Cookie className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Cookie Voorkeuren</h3>
                    <p className="text-xs text-slate-600">We respecteren je privacy</p>
                  </div>
                </div>
                
                <div className="items-center hidden space-x-4 text-xs md:flex text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>Veilig</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-blue-500" />
                    <span>Transparant</span>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-3 py-1.5 rounded text-xs font-semibold hover:from-slate-700 hover:to-slate-600 transition-all duration-300"
                  >
                    Accepteren
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openSettings}
                    className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-200 transition-all duration-300 flex items-center space-x-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Instellingen</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRejectAll}
                    className="border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-50 transition-all duration-300"
                  >
                    Alleen Essentieel
                  </motion.button>
                </div>
                
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Settings Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Cookie Instellingen</h3>
                    <p className="text-xs text-slate-600">Kies welke cookies je wilt toestaan</p>
                  </div>
                </div>
                <button
                  onClick={closeSettings}
                  className="p-1 transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* Essential Cookies */}
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-800">Essentiële</h4>
                    <div className="relative w-8 h-4 rounded-full opacity-50 cursor-not-allowed bg-slate-300">
                      <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Noodzakelijk voor de werking van de website.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-800">Analytisch</h4>
                    <div 
                      className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
                        preferences.analytics ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.analytics ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Website verbeteren.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-800">Functioneel</h4>
                    <div 
                      className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
                        preferences.functional ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, functional: !prev.functional }))}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.functional ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Voorkeuren onthouden.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-800">Marketing</h4>
                    <div 
                      className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
                        preferences.marketing ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.marketing ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Gepersonaliseerd.
                  </p>
                </div>
              </div>

              {/* Settings Actions */}
              <div className="flex justify-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAcceptSelected}
                  className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-1.5 rounded text-xs font-semibold hover:from-slate-700 hover:to-slate-600 transition-all duration-300"
                >
                  Opslaan
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeSettings}
                  className="border border-slate-300 text-slate-700 px-4 py-1.5 rounded text-xs font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Annuleren
                </motion.button>
              </div>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
