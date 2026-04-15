import type { Metadata } from 'next';
import { blogPosts } from '@/data/blog-posts';
import BlogPostClient from './BlogPostClient';

const SITE_URL = 'https://www.intrict.com';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Artikel niet gevonden',
      description: 'Dit artikel bestaat niet of is verwijderd.',
    };
  }

  // Ensure OG image is 1200×630 — rewrite Unsplash params if needed
  const ogImage = post.image.includes('unsplash.com')
    ? post.image.replace(/\?.*$/, '') + '?w=1200&h=630&fit=crop&auto=format&q=80'
    : post.image;

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default function BlogPostPage() {
  return <BlogPostClient />;
}
