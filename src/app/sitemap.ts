import type { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://www.intrict.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/over`,
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/oplossingen`,
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/visie`,
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date('2026-04-23'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date('2026-04-15'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date('2026-03-27'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/voorwaarden`,
      lastModified: new Date('2026-03-27'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookies`,
      lastModified: new Date('2026-03-27'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/gdpr`,
      lastModified: new Date('2026-03-27'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
