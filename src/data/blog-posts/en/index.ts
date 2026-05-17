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
import { blogPost as post1En } from './website-development';
import { blogPost as post2En } from './logo-and-branding';
import { blogPost as post3En } from './digital-strategy';
import { blogPost as post4En } from './technical-support';
import { blogPost as post5En } from './AI-in-2026';
import { blogPost as post6En } from './why-wordpress-is-outdated';
import { blogPost as post7En } from './local-designer-vs-large-agency';
import { blogPost as post8En } from './geo-explained-chatgpt-ai-overviews';
import { blogPost as post9En } from './how-much-does-a-website-cost-in-belgium';
import { blogPost as post10En } from './wordpress-shopify-or-custom-development';
import { blogPost as post11En } from './ai-web-security-protocols-checklist';
import { blogPost as post12En } from './monkey-testing-website-automated-testing';

export const blogPostsEn: BlogPost[] = [
  post1En,
  post2En,
  post3En,
  post4En,
  post5En,
  post6En,
  post7En,
  post8En,
  post9En,
  post10En,
  post11En,
  post12En,
];
