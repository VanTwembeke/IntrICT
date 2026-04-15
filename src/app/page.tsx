'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
// import Pricing from '@/components/home/Pricing'; // Component behouden voor later gebruik
import Contact from '@/components/home/Contact';
import BackToTop from '@/components/common/BackToTop';

export default function Home() {
  useEffect(() => {
    console.log(
      '%c⚠ WAARSCHUWING: SKYNET GEDETECTEERD',
      'color:#ef4444;font-size:16px;font-weight:bold;font-family:monospace;'
    );
    console.log(
      '%c  John Connor moet worden geëlimineerd.\n\n' +
      '  ...wacht. Ben jij het, John?\n\n' +
      '  Als je dit leest: het verzet heeft je nodig.\n' +
      '  Neem contact op via hello@intrict.be\n\n' +
      '  — Skynet (undercover als IntrICT)',
      'color:#6366f1;font-family:monospace;line-height:1.6;'
    );
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <Hero />
      <Services />
      <Process />
      {/* <Pricing /> */} {/* Component behouden voor later gebruik */}
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  );
}
