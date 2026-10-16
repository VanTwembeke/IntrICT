import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog-posts';
import { blogPostsEn } from '@/data/blog-posts/en';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://www.intrict.com';
  const allBlogPosts = [...blogPosts, ...blogPostsEn];
  const latestBlogUpdate = allBlogPosts.reduce((latest, post) => {
    const updatedAt = new Date(post.updatedAt);
    return updatedAt > latest ? updatedAt : latest;
  }, new Date('2026-04-23'));

  // Omit lastModified for static pages without a verified content-modification date.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      // The homepage's latest-articles section changes when real blog content changes.
      lastModified: latestBlogUpdate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/over`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/portfolio`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/oplossingen`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/visie`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestBlogUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/voorwaarden`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookies`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/gdpr`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = allBlogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
    ...(post.translationSlug
      ? {
          alternates: {
            languages: {
              [post.lang === 'en' ? 'en' : 'nl-BE']: `${siteUrl}/blog/${post.slug}`,
              [post.lang === 'en' ? 'nl-BE' : 'en']: `${siteUrl}/blog/${post.translationSlug}`,
            },
          },
        }
      : {}),
  }));

  return [...staticRoutes, ...blogRoutes];
}
