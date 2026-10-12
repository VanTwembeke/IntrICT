import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../src/contexts/LanguageContext';
import Portfolio from '../src/app/portfolio/PortfolioClient';

vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
// Isolate shared chrome; the page and language state are real.
vi.mock('@/components/common/Header', () => ({ default: function Header() {
  const { setLang } = useLanguage();
  return React.createElement('nav', null, ...['nl', 'en'].map(locale => React.createElement('button', { key: locale, onClick: () => setLang(locale) }, locale)));
} }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
afterEach(() => { cleanup(); localStorage.clear(); document.documentElement.lang = 'nl-BE'; });

test('portfolio switches all page copy to English without inventing projects or changing destinations', () => {
  render(React.createElement(LanguageProvider, null, React.createElement(Portfolio)));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mijn werk');
  fireEvent.click(screen.getByRole('button', { name: 'en' }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('My work');
  expect(screen.getByText('Under construction')).toBeTruthy();
  expect(screen.getByText(/IntrICT is a young business/)).toBeTruthy();
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('IntrICT.com — this website');
  expect(screen.getByText(/Full stack: Next.js 16/).textContent).toContain('customer dashboard');
  expect(screen.getByText('Live')).toBeTruthy();
  expect(screen.getByText('Open-source & personal projects')).toBeTruthy();
  expect(screen.getByText('View my code and side projects on GitHub')).toBeTruthy();
  expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Want to be the first client project?');
  expect(screen.getByText(/I am taking on new projects/)).toBeTruthy();
  expect(screen.getByRole('link', { name: 'View live' }).getAttribute('href')).toBe('https://www.intrict.com');
  expect(screen.getByRole('link', { name: 'GitHub profile' }).getAttribute('href')).toBe('https://github.com/VanTwembeke');
  expect(screen.getByRole('link', { name: 'Schedule a free chat' }).getAttribute('href')).toBe('/contact');
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  expect(document.documentElement.lang).toBe('en');
  fireEvent.click(screen.getByRole('button', { name: 'nl' }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mijn werk');
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('IntrICT.com — deze website');
  expect(screen.getByRole('link', { name: 'Gratis gesprek plannen' }).getAttribute('href')).toBe('/contact');
});
