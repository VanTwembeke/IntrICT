import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Process from '@/components/home/Process';
import Pricing from '@/components/home/Pricing';
import Contact from '@/components/home/Contact';
import BlogPostNotification from '@/components/home/BlogPostNotification';
import BackToTop from '@/components/common/BackToTop';
import HomeEffects from './HomeEffects';
import { blogPosts } from '@/data/blog-posts';
import { createClient } from '@/lib/supabase/server';
import type { Package } from '@/lib/types';

export default async function Home() {
  // Fetch packages for the pricing section
  let monthlyPackages: Package[] = [];
  let oneTimePackages: Package[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    const all = (data ?? []) as Package[];
    monthlyPackages = all.filter((p) => p.billing_interval === 'monthly');
    oneTimePackages = all.filter((p) => p.billing_interval === 'one_time');
  } catch { /* packages not accessible — section hidden */ }

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
      <Pricing monthlyPackages={monthlyPackages} oneTimePackages={oneTimePackages} />
      <BlogPostNotification post={latestPostMeta} />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  );
}
