import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
// import Pricing from '@/components/home/Pricing'; // Component behouden voor later gebruik
import Contact from '@/components/home/Contact';
import LatestPost from '@/components/home/LatestPost';
import BackToTop from '@/components/common/BackToTop';
import HomeEffects from './HomeEffects';
import { blogPosts } from '@/data/blog-posts';

export default function Home() {
  const latestPost = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  // Strip content field — only pass meta to the client component
  const { content: _content, ...latestPostMeta } = latestPost;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <HomeEffects />
      <Header />
      <Hero />
      <Services />
      <Process />
      {/* <Pricing /> */} {/* Component behouden voor later gebruik */}
      <LatestPost post={latestPostMeta} />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  );
}
