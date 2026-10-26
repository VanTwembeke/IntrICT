import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import history from './fixtures/blog-publication-history.json';
import { blogPostsNl, blogPostsEn, getAllBlogPosts, getBlogPostsByCategory, getBlogPostsByTag, getRelatedPosts, getBlogActivityDate } from '../src/lib/blog-api';
import Home from '../src/app/page';
import LatestNews from '../src/components/home/LatestNews';
import BlogPostNotification from '../src/components/home/BlogPostNotification';
import ArticlePage, { generateMetadata } from '../src/app/blog/[slug]/page';
import sitemap from '../src/app/sitemap';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => { throw new Error('No database in editorial tests'); } }));
vi.mock('../src/app/blog/[slug]/BlogPostClient', () => ({ default: () => null }));
const savedNl = [...blogPostsNl];
const savedEn = [...blogPostsEn];
afterEach(() => { blogPostsNl.splice(0, Infinity, ...savedNl); blogPostsEn.splice(0, Infinity, ...savedEn); });
const updated = { ...savedNl[0], slug: 'actual-update', publishedAt: '2026-03-27', updatedAt: '2026-10-12', category: 'Fixture', tags: ['fixture'] };
const newer = { ...updated, slug: 'newer-publication', publishedAt: '2026-10-10', updatedAt: '2026-10-10' };
const other = { ...updated, slug: 'current-article', updatedAt: '2026-03-27' };
function useFixtures() {
  blogPostsNl.splice(0, Infinity, newer, updated, other);
  blogPostsEn.splice(0, Infinity, ...[newer, updated, other].map(p => ({ ...p, lang: 'en', slug: p.slug + '-en' })));
}
function findElement(node, type) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === type) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const match = findElement(child, type);
    if (match) return match;
  }
  return null;
}

for (const lang of ['nl', 'en']) test(`${lang}: all metadata APIs return visible editorial order while retaining factual metadata`, async () => {
  useFixtures();
  const expected = ['newer-publication', 'actual-update', 'current-article'].map(s => lang === 'en' ? s + '-en' : s);
  for (const result of [await getAllBlogPosts(lang), await getBlogPostsByCategory('fixture', lang), await getBlogPostsByTag('fixture', lang)]) {
    expect(result.map(p => p.slug)).toEqual(expected);
    expect(result[1].publishedAt).toBe('2026-03-27');
    expect(result[1].updatedAt).toBe('2026-10-12');
    expect(result[0]).not.toHaveProperty('content');
  }
  expect((await getRelatedPosts(lang === 'en' ? 'current-article-en' : 'current-article')).map(p => p.slug)).toEqual(expected.slice(0, 2));
});

test('homepage chooses both language top-four selections by visible editorial date before slicing', async () => {
  useFixtures();
  const node = findElement(await Home(), LatestNews);
  expect(node.props.postsNl.map(p => p.slug)).toEqual(['newer-publication', 'actual-update', 'current-article']);
  expect(node.props.postsEn.map(p => p.slug)).toEqual(['newer-publication-en', 'actual-update-en', 'current-article-en']);
});

test('the new-article notification does not call an updated old article a new publication', async () => {
  useFixtures();
  expect(findElement(await Home(), BlogPostNotification).props.post.slug).toBe('newer-publication');
});

test('sitemap reflects actual homepage, blog index and article activity without today stamping', () => {
  useFixtures();
  const entries = sitemap();
  for (const path of ['', '/blog', '/blog/actual-update']) {
    expect(entries.find(e => e.url === 'https://www.intrict.com' + path).lastModified.toISOString()).toBe('2026-10-12T00:00:00.000Z');
  }
  expect(entries.find(e => e.url.endsWith('/blog/current-article')).lastModified.toISOString()).toBe('2026-03-27T00:00:00.000Z');
});

test('schema and OpenGraph expose actual edit dates and preserve original publication', async () => {
  useFixtures();
  const params = Promise.resolve({ slug: updated.slug });
  const metadata = await generateMetadata({ params });
  expect(metadata.openGraph.publishedTime).toBe('2026-03-27');
  expect(metadata.openGraph.modifiedTime).toBe('2026-10-12');
  const html = renderToStaticMarkup(await ArticlePage({ params }));
  const scripts = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  const article = scripts.find(s => s['@type'] === 'BlogPosting');
  expect(article.datePublished).toBe('2026-03-27');
  expect(article.dateModified).toBe('2026-10-12');
});

test('redistributed schema preserves factual publication without a migration notice', async () => {
  const post = savedNl.find(p => p.slug === 'website-ontwikkeling');
  const params = Promise.resolve({ slug: post.slug });
  const metadata = await generateMetadata({ params });
  expect(metadata.openGraph.publishedTime).toBe('2026-03-27');
  expect(metadata.openGraph.modifiedTime).toBe('2026-10-16');
  expect(metadata.other['original-publication-date']).toBe('2026-03-27');
  expect(metadata.other['publication-date-basis']).toBe('editorial-schedule');
  const html = renderToStaticMarkup(await ArticlePage({ params }));
  const scripts = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  const article = scripts.find(s => s['@type'] === 'BlogPosting');
  expect(article.datePublished).toBe('2026-03-27');
  expect(article.dateModified).toBe('2026-10-16');
  expect(article.description).toBe(post.excerpt);
});

for (const locale of ['nl', 'en']) test(`${locale}: standard publication metadata uses factual dates for every article, including unmigrated posts`, async () => {
  const posts = locale === 'en' ? savedEn : savedNl;
  expect(posts.some(post => post.originalPublishedAt !== undefined)).toBe(true);
  expect(posts.some(post => post.originalPublishedAt === undefined)).toBe(true);
  for (const post of posts) {
    const params = Promise.resolve({ slug: post.slug });
    const metadata = await generateMetadata({ params });
    expect(metadata.openGraph.publishedTime, post.slug).toBe(post.originalPublishedAt ?? post.publishedAt);
    expect(metadata.openGraph.modifiedTime, post.slug).toBe(post.updatedAt);
    const html = renderToStaticMarkup(await ArticlePage({ params }));
    const scripts = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
    const article = scripts.find(s => s['@type'] === 'BlogPosting');
    expect(article.datePublished, post.slug).toBe(post.originalPublishedAt ?? post.publishedAt);
    expect(article.dateModified, post.slug).toBe(post.updatedAt);
    expect(article.description, post.slug).toBe(post.excerpt);
  }
});

test('inventory publication dates and reciprocal slugs are preserved for every original post', () => {
  for (const snapshot of history) {
    const post = [...blogPostsNl, ...blogPostsEn].find(p => p.slug === snapshot.slug);
    expect(post, snapshot.slug).toBeTruthy();
    expect(post.originalPublishedAt ?? post.publishedAt, snapshot.slug).toBe(snapshot.publishedAt);
    expect(post.translationSlug, snapshot.slug).toBe(snapshot.translationSlug);
  }
});

test('local editorial artwork has an absolute public URL in article structured data', async () => {
  useFixtures();
  blogPostsNl[0].image = '/images/blog/inp-response-timeline.webp';
  const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: blogPostsNl[0].slug }) }));
  const scripts = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent));
  expect(scripts.find(s => s['@type'] === 'BlogPosting').image).toBe('https://www.intrict.com/images/blog/inp-response-timeline.webp');
});

test('unchanged and earlier-update metadata never imply a newer activity date', () => {
  expect(getBlogActivityDate(other)).toBe('2026-03-27');
  expect(getBlogActivityDate({ publishedAt: '2026-10-10', updatedAt: '2026-03-27' })).toBe('2026-10-10');
});
