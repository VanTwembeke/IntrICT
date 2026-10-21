import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { translations } from '../src/i18n';
import Footer from '../src/components/common/Footer';
vi.mock('@/app/actions/newsletter', () => ({ subscribeNewsletter: vi.fn() }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('requestAnimationFrame', () => 0);
afterEach(() => { cleanup(); localStorage.clear(); });
for (const lang of ['nl', 'en']) test(`${lang}: footer legal text remains readable on its dark background`, () => {
  localStorage.setItem('lang', lang);
  const { container } = render(React.createElement(LanguageProvider, null, React.createElement(Footer)));
  const footer = container.querySelector('footer');
  expect(footer.classList.contains('bg-slate-900')).toBe(true);
  const copyright = [...footer.querySelectorAll('p')].find(e => e.textContent.includes('©'));
  expect(copyright.textContent).toBe(translations[lang].footer.copyright(new Date().getFullYear()));
  const bar = copyright.parentElement;
  const links = [...bar.querySelectorAll('a')];
  expect(links.map(a => a.getAttribute('href'))).toEqual(['/sitemap.xml', '/robots.txt', '/privacy', '/voorwaarden', '/cookies', '/gdpr']);
  expect(links.map(a => a.textContent)).toEqual(Object.values(translations[lang].footer.legal));
  for (const node of [copyright, ...links]) {
    expect(node.classList.contains('text-slate-400')).toBe(true);
    expect(node.classList.contains('text-slate-600')).toBe(false);
  }
  for (const link of links) expect(link.classList.contains('hover:text-white')).toBe(true);
});
