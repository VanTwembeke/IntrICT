import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import LatestNews from '../src/components/home/LatestNews';
let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang }) }));
vi.mock('next/image', () => ({ default: ({ fill, ...props }) => { void fill; return React.createElement('img', props); } }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('requestAnimationFrame', () => 0);
afterEach(cleanup);
const posts = Array.from({ length: 4 }, (_, i) => ({ id: String(i), slug: `article-${i}`, title: `Article ${i}`, excerpt: `Excerpt ${i}`, image: '/images/test.svg', publishedAt: `2026-10-${16-i}`, category: `Category ${i}`, readTime: 5 }));
for (const locale of ['nl', 'en']) test(`${locale}: latest news small text uses AA-readable solid palette on white`, () => {
  lang = locale;
  const { container } = render(React.createElement(LatestNews, { postsNl: posts, postsEn: posts }));
  const badge = [...container.querySelectorAll('span')].find(e => e.textContent === 'Category 0');
  expect(badge.classList.contains('bg-blue-700')).toBe(true);
  expect(badge.classList.contains('text-white')).toBe(true);
  const date = container.querySelector('time').closest('p');
  expect(date.classList.contains('text-slate-600')).toBe(true);
  for (const link of [...container.querySelectorAll('a')].filter(a => /article-[1-3]$/.test(a.getAttribute('href')))) {
    expect(link.querySelector('span').classList.contains('text-blue-700')).toBe(true);
    expect(link.querySelector('time').closest('.normal-case').classList.contains('text-slate-600')).toBe(true);
    expect(link.querySelector('p').classList.contains('text-slate-600')).toBe(true);
  }
  expect([...container.querySelectorAll('h3')].map(e => e.textContent)).toEqual(posts.map(p => p.title));
  expect([...container.querySelectorAll('time')].map(e => e.dateTime)).toEqual(posts.map(p => p.publishedAt));
});
