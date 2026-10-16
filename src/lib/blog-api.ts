/* eslint-disable @typescript-eslint/no-unused-vars */
import { blogPosts as blogPostsNl } from '@/data/blog-posts';
import { blogPostsEn } from '@/data/blog-posts/en';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  /** Editorial schedule date when originalPublishedAt is present. */
  publishedAt: string;
  /** Factual first publication retained after an explicitly authorized schedule revision. */
  originalPublishedAt?: string;
  updatedAt: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
  readTime: number;
  /** Language this post is written in (default: 'nl') */
  lang?: 'nl' | 'en';
  /** Slug of the equivalent post in the other language */
  translationSlug?: string;
}

export interface BlogPostMeta {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  /** Editorial schedule date when originalPublishedAt is present. */
  publishedAt: string;
  /** Factual first publication retained after an explicitly authorized schedule revision. */
  originalPublishedAt?: string;
  updatedAt: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
  readTime: number;
  lang?: 'nl' | 'en';
  translationSlug?: string;
}

export { blogPostsNl, blogPostsEn };

/** Metadata contains real editorial dates; never infer activity from today's clock. */
export function getBlogActivityDate(post: Pick<BlogPostMeta, 'publishedAt' | 'updatedAt'>): string {
  return post.updatedAt > post.publishedAt ? post.updatedAt : post.publishedAt;
}

/** Latest activity first; a newly published post wins ties with an older update. */
export function sortBlogPostsByActivity<T extends Pick<BlogPostMeta, 'publishedAt' | 'updatedAt'>>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) =>
    getBlogActivityDate(b).localeCompare(getBlogActivityDate(a)) || b.publishedAt.localeCompare(a.publishedAt)
  );
}

/** Returns the correct post array for the given language. Falls back to NL if no EN posts exist. */
export function getBlogPostsForLang(lang?: string): BlogPost[] {
  if (lang === 'en' && blogPostsEn.length > 0) return blogPostsEn;
  return blogPostsNl;
}

// API functions
export async function getAllBlogPosts(lang?: string): Promise<BlogPostMeta[]> {
  const posts = getBlogPostsForLang(lang);
  return sortBlogPostsByActivity(posts).map(({ content, ...meta }) => meta);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Search across both language arrays — slug uniquely identifies a post
  const allPosts = [...blogPostsNl, ...blogPostsEn];
  return allPosts.find((post) => post.slug === slug) ?? null;
}

export async function getBlogPostsByCategory(category: string, lang?: string): Promise<BlogPostMeta[]> {
  const posts = getBlogPostsForLang(lang);
  return sortBlogPostsByActivity(posts)
    .filter((post) => post.category.toLowerCase() === category.toLowerCase())
    .map(({ content, ...meta }) => meta);
}

export async function getBlogPostsByTag(tag: string, lang?: string): Promise<BlogPostMeta[]> {
  const posts = getBlogPostsForLang(lang);
  return sortBlogPostsByActivity(posts)
    .filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    .map(({ content, ...meta }) => meta);
}

export async function getRelatedPosts(currentSlug: string, limit: number = 3): Promise<BlogPostMeta[]> {
  // Find the post in any language
  const allPosts = [...blogPostsNl, ...blogPostsEn];
  const currentPost = allPosts.find((post) => post.slug === currentSlug);
  if (!currentPost) return [];

  // Find related posts in the same language
  const sourcePosts = getBlogPostsForLang(currentPost.lang ?? 'nl');
  return sortBlogPostsByActivity(sourcePosts)
    .filter(
      (post) =>
        post.slug !== currentSlug &&
        (post.category === currentPost.category ||
          post.tags.some((tag) => currentPost.tags.includes(tag)))
    )
    .slice(0, limit)
    .map(({ content, ...meta }) => meta);
}
