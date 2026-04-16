/**
 * English blog posts
 *
 * Add your translated post files to this folder and import them here.
 * Each file must export a `blogPost` that satisfies the `BlogPost` interface
 * from `@/lib/blog-api`.
 *
 * To link an English post to its Dutch counterpart (and vice versa), set
 * `translationSlug` on each post to the slug of the other language version.
 *
 * Example:
 *
 *   // en/website-development.ts
 *   export const blogPost: BlogPost = {
 *     id: '1-en',
 *     slug: 'website-development',
 *     lang: 'en',
 *     translationSlug: 'website-ontwikkeling',   // ← points to the Dutch post
 *     // ...
 *   };
 *
 *   // nl/website-ontwikkeling.ts (or the existing NL file)
 *   export const blogPost: BlogPost = {
 *     id: '1',
 *     slug: 'website-ontwikkeling',
 *     lang: 'nl',
 *     translationSlug: 'website-development',    // ← points to the English post
 *     // ...
 *   };
 *
 * Then import and add the post below, e.g.:
 *   import { blogPost as post1En } from './website-development';
 *   export const blogPostsEn = [post1En];
 */

import type { BlogPost } from '@/lib/blog-api';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _check = BlogPost; // keep type in scope

export const blogPostsEn: BlogPost[] = [
  // Add your English posts here once you create the translation files.
];
