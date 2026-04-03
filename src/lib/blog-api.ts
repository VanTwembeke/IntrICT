/* eslint-disable @typescript-eslint/no-unused-vars */
import { blogPosts } from '@/data/blog-posts';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
  readTime: number;
}

export interface BlogPostMeta {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
  readTime: number;
}

// API functions
export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  return blogPosts.map(({ content, ...meta }) => meta);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = blogPosts.find(post => post.slug === slug);
  return post || null;
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPostMeta[]> {
  return blogPosts
    .filter(post => post.category.toLowerCase() === category.toLowerCase())
    .map(({ content, ...meta }) => meta);
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  return blogPosts
    .filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
    .map(({ content, ...meta }) => meta);
}

export async function getRelatedPosts(currentSlug: string, limit: number = 3): Promise<BlogPostMeta[]> {
  const currentPost = blogPosts.find(post => post.slug === currentSlug);
  if (!currentPost) return [];

  const relatedPosts = blogPosts
    .filter(post => 
      post.slug !== currentSlug && 
      (post.category === currentPost.category || 
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, limit)
    .map(({ content, ...meta }) => meta);

  return relatedPosts;
}
