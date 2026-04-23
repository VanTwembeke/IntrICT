import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
// import Pricing from '@/components/home/Pricing'; // Component behouden voor later gebruik
import Contact from '@/components/home/Contact';
import BackToTop from '@/components/common/BackToTop';
import HomeEffects from './HomeEffects';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HomeEffects />
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
