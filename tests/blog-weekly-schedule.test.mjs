import { expect, test } from 'vitest';
import history from './fixtures/blog-publication-history.json';
import { blogPostsNl, blogPostsEn, getAllBlogPosts } from '../src/lib/blog-api';

const today = '2026-10-16'; // Fixed migration/release date, not a rolling reschedule.
const contactSlugs = ['contactformulier-kmo-veilig-toegankelijk', 'contact-forms-sme-safe-accessible'];

test('the new contact-form pair is registered with a truthful first release date, not backdated to Monday', () => {
  const migrationSlugs = new Set([...history.map(p => p.slug), ...contactSlugs]);
  expect(blogPostsNl.filter(p => migrationSlugs.has(p.slug))).toHaveLength(15);
  expect(blogPostsEn.filter(p => migrationSlugs.has(p.slug))).toHaveLength(15);
  for (const slug of contactSlugs) {
    const post = [...blogPostsNl, ...blogPostsEn].find(p => p.slug === slug);
    expect(post, slug).toBeTruthy();
    expect(post.publishedAt).toBe(today);
    expect(post.updatedAt).toBe(today);
    expect(post.originalPublishedAt).toBeUndefined();
  }
});
const monday = new Date(`${today}T00:00:00Z`);
monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
const stableOriginalOrder = history.slice(0, 14).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

test('authorized redistribution is one logical article each Monday, stable oldest-to-newest, without future dates', () => {
  const archiveSlugs = new Set(history.map(p => p.slug));
  expect(blogPostsNl.filter(p => archiveSlugs.has(p.slug))).toHaveLength(14);
  expect(blogPostsEn.filter(p => archiveSlugs.has(p.slug))).toHaveLength(14);
  for (const [index, snapshot] of stableOriginalOrder.entries()) {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() - 7 * (stableOriginalOrder.length - index));
    const post = blogPostsNl.find(p => p.slug === snapshot.slug);
    expect(post.publishedAt, snapshot.slug).toBe(date.toISOString().slice(0, 10));
    expect(post.publishedAt <= today).toBe(true);
  }
  expect(new Set(blogPostsNl.filter(p => archiveSlugs.has(p.slug)).map(p => p.publishedAt)).size).toBe(14);
  for (const post of [...blogPostsNl, ...blogPostsEn].filter(p => contactSlugs.includes(p.slug))) {
    expect(post.originalPublishedAt).toBeUndefined();
    expect(post.publishedAt).toBe(today);
    expect(post.updatedAt).toBe(today);
  }
});

test('all factual original dates and translation dates survive the editorial revision', async () => {
  for (const snapshot of history) {
    const post = [...blogPostsNl, ...blogPostsEn].find(p => p.slug === snapshot.slug);
    const counterpart = [...blogPostsNl, ...blogPostsEn].find(p => p.slug === post.translationSlug);
    expect(post.originalPublishedAt ?? post.publishedAt, snapshot.slug).toBe(snapshot.publishedAt);
    expect(post.translationSlug).toBe(snapshot.translationSlug);
    expect(counterpart.publishedAt).toBe(post.publishedAt);
    expect(counterpart.originalPublishedAt ?? counterpart.publishedAt).toBe(snapshot.publishedAt);
    expect(post.updatedAt >= post.publishedAt).toBe(true);
    if (post.publishedAt !== snapshot.publishedAt) expect(post.updatedAt).toBe(today);
  }
  for (const locale of ['nl', 'en']) {
    const metadata = await getAllBlogPosts(locale);
    const expected = [...(locale === 'nl' ? blogPostsNl : blogPostsEn)].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    expect(metadata.map(p => p.slug)).toEqual(expected.map(p => p.slug));
    for (const post of metadata) expect(post.originalPublishedAt).toBe(expected.find(p => p.slug === post.slug).originalPublishedAt);
  }
});


test('W43 popover pair adds one truthful weekly publication without rewriting the migration', () => {
  const slugs = ['native-popover-kmo-website', 'native-popovers-sme-website'];
  const all = [...blogPostsNl, ...blogPostsEn];
  expect(blogPostsNl).toHaveLength(16);
  expect(blogPostsEn).toHaveLength(16);
  expect(new Set(all.map(p => p.id)).size).toBe(32);
  const pair = slugs.map(slug => all.find(p => p.slug === slug));
  for (const [index, post] of pair.entries()) {
    expect(post).toBeTruthy();
    expect(post.translationSlug).toBe(slugs[1 - index]);
    expect(post.publishedAt).toBe('2026-10-19');
    expect(post.originalPublishedAt).toBeUndefined();
    expect(post.updatedAt).toBeUndefined();
    expect(post.image).toBe('/images/blog/native-popover.webp');
  }
  expect(all.filter(p => p.publishedAt === '2026-10-19').map(p => p.slug).sort()).toEqual([...slugs].sort());
  expect(all.filter(p => !slugs.includes(p.slug)).some(p => p.image === pair[0].image)).toBe(false);
});
