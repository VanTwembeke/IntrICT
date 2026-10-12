import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
import BlogPostClient from '../src/app/blog/[slug]/BlogPostClient';
import * as blogApi from '../src/lib/blog-api';
import BlogClient from '../src/app/blog/BlogClient';
import LatestNews from '../src/components/home/LatestNews';
import LatestPost from '../src/components/home/LatestPost';

for (const locale of ['nl', 'en']) test(`${locale}: blog and homepage cards show original and updated dates in recent activity order`, () => {
  lang = locale;
  const newer = { ...original, slug: 'newer-publication', title: 'Newer publication', publishedAt: '2026-10-10', updatedAt: '2026-10-10' };
  vi.spyOn(blogApi, 'getBlogPostsForLang').mockReturnValue([newer, original]);
  const blog = render(React.createElement(BlogClient));
  expect([...blog.container.querySelectorAll('article h2, article h3')].map(h => h.textContent)).toEqual(['Original article', 'Newer publication']);
  expect([...blog.container.querySelectorAll('time')].map(t => t.dateTime)).toEqual(['2026-03-27', '2026-10-12', '2026-10-10']);
  blog.unmount();
  const home = render(React.createElement(LatestNews, { postsNl: [newer, original], postsEn: [newer, original] }));
  expect([...home.container.querySelectorAll('h3')].map(h => h.textContent)).toEqual(['Original article', 'Newer publication']);
  expect([...home.container.querySelectorAll('time')].map(t => t.dateTime)).toEqual(['2026-03-27', '2026-10-12', '2026-10-10']);
  home.unmount();
  const card = render(React.createElement(LatestPost, { post: original }));
  expect([...card.container.querySelectorAll('time')].map(t => t.dateTime)).toEqual(['2026-03-27', '2026-10-12']);
  expect(card.container.textContent).toContain(locale === 'nl' ? 'Bijgewerkt op' : 'Updated on');
});

let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang, t: lang === 'en' ? en : nl }) }));
vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), notFound: vi.fn() }));
vi.mock('next/image', () => ({ default: ({ fill, priority, ...props }) => { void fill; void priority; return React.createElement('img', props); } }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('requestAnimationFrame', () => 0);
afterEach(() => { cleanup(); vi.restoreAllMocks(); lang = 'nl'; });
const original = { id: 'date-fixture', title: 'Original article', excerpt: 'Excerpt', content: '# Original article\n\nText\n\n## Detail\nMore text', author: 'Jonas', publishedAt: '2026-03-27', updatedAt: '2026-10-12', category: 'Web', tags: ['Web'], image: '/images/test.svg', slug: 'original-article', readTime: 3 };

test('recent activity puts a real update first, breaking ties by original publication without mutating posts', () => {
  const recent = { ...original, slug: 'recent', publishedAt: '2026-10-10', updatedAt: '2026-10-10' };
  const tie = { ...original, slug: 'new-on-same-day', publishedAt: '2026-10-12', updatedAt: '2026-10-12' };
  const posts = [recent, original, tie];
  expect(typeof blogApi.sortBlogPostsByActivity).toBe('function');
  expect(blogApi.sortBlogPostsByActivity(posts).map(p => p.slug)).toEqual(['new-on-same-day', 'original-article', 'recent']);
  expect(posts.map(p => p.slug)).toEqual(['recent', 'original-article', 'new-on-same-day']);
  expect(original.publishedAt).toBe('2026-03-27');
});

for (const locale of ['nl', 'en']) test(`${locale}: the hero is the only H1 and an identical leading markdown title is not repeated`, () => {
  lang = locale;
  render(React.createElement(BlogPostClient, { initialPost: { ...original, lang: locale, content: original.content + '\n# A distinct section' }, initialRelatedPosts: [] }));
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getAllByRole('heading', { name: original.title })).toHaveLength(1);
  expect(screen.getByRole('heading', { level: 2, name: 'A distinct section' })).toBeTruthy();
});

for (const locale of ['nl', 'en']) test(`${locale}: unchanged articles show only publication and never imply an update`, () => {
  lang = locale;
  for (const updatedAt of ['2026-03-27', '2026-03-26']) {
    const post = { ...original, updatedAt, lang: locale };
    for (const element of [
      React.createElement(BlogPostClient, { initialPost: post, initialRelatedPosts: [] }),
      React.createElement(LatestNews, { postsNl: [post], postsEn: [post] }),
      React.createElement(LatestPost, { post }),
    ]) {
      const view = render(element);
      expect([...view.container.querySelectorAll('time')].map(t => t.dateTime)).toEqual(['2026-03-27']);
      expect(view.container.textContent).not.toContain(locale === 'nl' ? 'Bijgewerkt op' : 'Updated on');
      view.unmount();
    }
  }
});

test('calendar-date rendering explicitly uses UTC instead of shifting a day for western timezones', () => {
  const format = vi.spyOn(Date.prototype, 'toLocaleDateString');
  render(React.createElement(LatestPost, { post: original }));
  expect(format).toHaveBeenCalledWith('nl-BE', expect.objectContaining({ timeZone: 'UTC' }));
});

for (const locale of ['nl', 'en']) test(`${locale}: actual update is visible without replacing the original publication`, () => {
  lang = locale;
  const { container } = render(React.createElement(BlogPostClient, { initialPost: { ...original, lang: locale }, initialRelatedPosts: [] }));
  const times = [...container.querySelectorAll('time')];
  expect(times.map(t => t.dateTime)).toEqual(['2026-03-27', '2026-10-12']);
  expect(times[0].parentElement.textContent).toContain(locale === 'nl' ? 'Gepubliceerd op' : 'Published on');
  expect(times[1].parentElement.textContent).toContain(locale === 'nl' ? 'Bijgewerkt op' : 'Updated on');
  expect(times[0].textContent).toContain(locale === 'nl' ? '27 maart 2026' : '27 March 2026');
});
