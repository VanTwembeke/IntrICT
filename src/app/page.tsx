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
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
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
