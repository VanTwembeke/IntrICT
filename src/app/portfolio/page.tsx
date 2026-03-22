'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectGrid from '@/components/portfolio/ProjectGrid';
import ProjectCategories from '@/components/portfolio/ProjectCategories';
import CallToAction from '@/components/portfolio/CallToAction';

export default function Portfolio() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <PortfolioHero />
      <ProjectCategories />
      <ProjectGrid />
      <CallToAction />
      <Footer />
      <BackToTop />
    </div>
  );
}

