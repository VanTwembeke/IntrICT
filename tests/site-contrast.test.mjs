import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
import BlogPostNotification from '../src/components/home/BlogPostNotification';
import Portfolio from '../src/app/portfolio/PortfolioClient';
import Pricing from '../src/components/home/Pricing';
let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang, t: lang === 'nl' ? nl : en }) }));
vi.mock('../src/components/home/PackageRequestModal', () => ({ default: () => null }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
afterEach(cleanup);
const basic = { id: 'test-basic', name: 'Basic', price: 99, billing_interval: 'monthly', description: 'Monthly', features: [], color: 'blue', highlight: false };
const once = { ...basic, id: 'test-once', name: 'Service', billing_interval: 'one_time' };
for (const locale of ['nl', 'en']) test(`${locale}: pricing details and both inactive selectors keep AA-readable solid text`, () => {
  lang = locale;
  const t = locale === 'nl' ? nl : en;
  render(React.createElement(Pricing, { monthlyPackages: [basic], oneTimePackages: [once] }));
  expect(screen.getByText(t.pricing.perMonth).classList.contains('text-slate-600')).toBe(true);
  const monthly = screen.getByRole('button', { name: t.pricing.tabMonthly });
  const service = screen.getByRole('button', { name: t.pricing.tabOneTime });
  expect(service.classList.contains('text-slate-600')).toBe(true);
  expect(service.classList.contains('hover:text-slate-700')).toBe(true);
  fireEvent.click(service);
  expect(monthly.classList.contains('text-slate-600')).toBe(true);
  expect(service.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText(t.pricing.oneTime).classList.contains('text-slate-600')).toBe(true);
});

vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.mock('next/image', () => ({ default: ({ fill, ...props }) => { void fill; return React.createElement('img', props); } }));
vi.stubGlobal('requestAnimationFrame', () => 0);
const post = { slug: 'contrast-fixture', title: 'Article', image: '/images/test.svg', excerpt: 'Excerpt', category: 'Web Development', readTime: 5 };
for (const locale of ['nl', 'en']) test(`${locale}: audited blue CTA and notice surfaces use AA-readable normal and hover colors`, async () => {
  lang = locale;
  sessionStorage.clear();
  const { container } = render(React.createElement(React.Fragment, null,
    React.createElement(Pricing, { monthlyPackages: [basic], oneTimePackages: [once] }),
    React.createElement(Portfolio), React.createElement(BlogPostNotification, { post })));
  const dialog = await screen.findByRole('dialog', { name: locale === 'nl' ? 'Nieuw artikel' : 'New article' }, { timeout: 3000 });
  for (const link of container.querySelectorAll('a[href="#contact"], main a[href="/contact"]')) {
    expect.soft(link.classList.contains('bg-blue-700')).toBe(true);
    expect.soft(link.classList.contains('hover:bg-blue-800')).toBe(true);
    expect.soft(link.classList.contains('text-white')).toBe(true);
  }
  expect.soft(dialog.querySelector('span').classList.contains('bg-blue-700')).toBe(true);
  expect.soft(dialog.querySelector('p').classList.contains('text-blue-700')).toBe(true);
  expect(dialog.querySelector('a').getAttribute('href')).toBe('/blog/contrast-fixture');
});
