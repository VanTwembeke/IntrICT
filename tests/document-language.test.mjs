import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { LanguageProvider, useLanguage } from '../src/contexts/LanguageContext';
import BlogPostClient from '../src/app/blog/[slug]/BlogPostClient';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), notFound: vi.fn() }));
vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
vi.mock('next/image', () => ({ default: ({ fill, priority, ...props }) => { void fill; void priority; return React.createElement('img', props); } }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('requestAnimationFrame', () => 0);

function Selection({ route = '/' }) {
  const { lang, setLang } = useLanguage();
  return React.createElement('div', null,
    React.createElement('output', null, `${route}: ${lang}`),
    ...['nl', 'en'].map(locale => React.createElement('button', { key: locale, onClick: () => setLang(locale) }, locale)));
}
const tree = route => React.createElement(LanguageProvider, null, React.createElement(Selection, { route }));
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); document.documentElement.lang = 'nl-BE'; });

for (const selected of ['nl', 'en']) {
  test(`${selected}: article translation redirect still follows the selected context`, () => {
    localStorage.setItem('lang', selected);
    const opposite = selected === 'en' ? 'nl' : 'en';
    const post = { id: 'redirect-fixture', title: 'Article', excerpt: 'Excerpt', content: 'Text', author: 'Jonas', publishedAt: '2026-03-27', category: 'Web', tags: [], image: '/images/test.svg', slug: `article-${opposite}`, translationSlug: `article-${selected}`, lang: opposite, readTime: 3 };
    render(React.createElement(LanguageProvider, null, React.createElement(BlogPostClient, { initialPost: post, initialRelatedPosts: [] })));
    expect(push).toHaveBeenLastCalledWith(`/blog/article-${selected}`);
    expect(document.documentElement.lang).toBe(selected === 'en' ? 'en' : 'nl-BE');
  });
}

test('selection synchronizes the document language in both directions', () => {
  document.documentElement.lang = 'nl-BE';
  render(tree('/portfolio'));
  fireEvent.click(screen.getByRole('button', { name: 'en' }));
  expect(document.documentElement.lang).toBe('en');
  expect(localStorage.getItem('lang')).toBe('en');
  fireEvent.click(screen.getByRole('button', { name: 'nl' }));
  expect(document.documentElement.lang).toBe('nl-BE');
});

for (const stored of ['en', 'nl', 'invalid', null]) {
  test(`initial stored preference ${stored} maps to the selected document locale`, () => {
    if (stored) localStorage.setItem('lang', stored);
    document.documentElement.lang = 'fr';
    render(tree('/contact'));
    const selected = stored === 'en' ? 'en' : 'nl';
    expect(screen.getByText(`/contact: ${selected}`)).toBeTruthy();
    expect(document.documentElement.lang).toBe(selected === 'en' ? 'en' : 'nl-BE');
  });
}

test('selected context remains the language source across client route content changes', () => {
  localStorage.setItem('lang', 'en');
  const { rerender } = render(tree('/portfolio'));
  rerender(tree('/blog/website-development'));
  expect(screen.getByText('/blog/website-development: en')).toBeTruthy();
  expect(document.documentElement.lang).toBe('en');
  fireEvent.click(screen.getByRole('button', { name: 'nl' }));
  rerender(tree('/contact'));
  expect(document.documentElement.lang).toBe('nl-BE');
});

test('stored English is applied after hydration without changing the NL server markup', async () => {
  localStorage.setItem('lang', 'en');
  const container = document.createElement('div');
  container.innerHTML = renderToString(tree('/portfolio'));
  expect(container.textContent).toContain('/portfolio: nl');
  document.body.append(container);
  const onRecoverableError = vi.fn();
  let root;
  try {
    await act(async () => { root = hydrateRoot(container, tree('/portfolio'), { onRecoverableError }); });
    expect(container.textContent).toContain('/portfolio: en');
    expect(document.documentElement.lang).toBe('en');
    expect(onRecoverableError).not.toHaveBeenCalled();
  } finally {
    if (root) await act(async () => root.unmount());
    container.remove();
  }
});

test('unavailable localStorage does not prevent changing the document language', () => {
  const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  try {
    render(tree('/portfolio'));
    expect(document.documentElement.lang).toBe('nl-BE');
    fireEvent.click(screen.getByRole('button', { name: 'en' }));
    expect(document.documentElement.lang).toBe('en');
  } finally { get.mockRestore(); set.mockRestore(); }
});
