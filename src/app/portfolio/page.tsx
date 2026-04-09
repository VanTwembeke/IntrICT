'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectGrid from '@/components/portfolio/ProjectGrid';
import ProjectCategories from '@/components/portfolio/ProjectCategories';
import CallToAction from '@/components/portfolio/CallToAction';

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all');

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
      <PortfolioHero />
      <ProjectCategories activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <div id="projects">
        <ProjectGrid activeCategory={activeCategory} />
      </div>
      <CallToAction />
      <Footer />
      <BackToTop />
    </div>
  );
}
