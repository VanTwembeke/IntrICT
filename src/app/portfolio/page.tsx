'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import DemoGrid from '@/components/portfolio/DemoGrid';
import CallToAction from '@/components/portfolio/CallToAction';
import type { DemoMeta } from '@/app/api/demos/route';

export default function Portfolio() {
  const [demos, setDemos] = useState<DemoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    fetch('/api/demos')
      .then((r) => r.json())
      .then((data: DemoMeta[]) => {
        setDemos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <PortfolioHero />
      <div id="projects">
        <DemoGrid
          demos={demos}
          loading={loading}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
      <CallToAction />
      <Footer />
      <BackToTop />
    </div>
  );
}
