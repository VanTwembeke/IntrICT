import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Contact from '../src/app/contact/ContactClient';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang, t: lang === 'en' ? en : nl }) }));
vi.mock('@/lib/mailer', () => ({ sendMail: vi.fn() }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
vi.mock('../src/app/contact/ContactCalendar', () => ({ default: () => null }));
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
for (const locale of ['nl', 'en']) test(`${locale}: client shares server limits and supplies current locale without submitting`, () => {
  lang = locale;
  render(React.createElement(Contact));
  const form = document.querySelector('form');
  expect(form.querySelector('[name="locale"]').value).toBe(locale);
  for (const [field, min, max] of [['naam', 2, 100], ['email', null, 254], ['telefoon', null, 40], ['bericht', 10, 5000]]) {
    const input = form.querySelector(`[name="${field}"]`);
    if (min !== null) expect(input.minLength).toBe(min);
    expect(input.maxLength).toBe(max);
  }
});
test('phone card dials the same confirmed public number that it displays', () => {
  render(React.createElement(Contact));
  const phone = screen.getByText('0470 63 14 75').closest('a');
  expect(phone.getAttribute('href')).toBe('tel:+32470631475');
  expect(phone.getAttribute('href')).not.toContain('*');
});
test('Maps CTA uses AA contrast in normal and hover states', () => {
  render(React.createElement(Contact));
  const maps = document.querySelector('a[href="https://www.google.com/maps/search/Gent,+Belgium"]');
  expect(maps.className).toContain('bg-blue-700');
  expect(maps.className).toContain('hover:bg-blue-800');
  // Tailwind v4 palette resolved to sRGB; WCAG relative luminance.
  const ratio = (rgb) => {
    const linear = rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 1.05 / (linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 + 0.05);
  };
  expect(ratio([20, 71, 230])).toBeGreaterThanOrEqual(4.5);
  expect(ratio([25, 60, 184])).toBeGreaterThanOrEqual(4.5);
});

for (const locale of ['nl', 'en']) test(`${locale}: form section contains horizontal entrance motion without masking the page`, () => {
  lang = locale;
  const t = locale === 'en' ? en : nl;
  render(React.createElement(Contact));
  const section = document.querySelector('form').closest('section');
  expect(section.classList.contains('overflow-x-clip')).toBe(true);
  expect(section.className).not.toMatch(/overflow-(?:hidden|y-hidden)/);
  expect(screen.getByRole('heading', { name: t.contactPage.whatCanIDo, level: 3 }).closest('section')).toBe(section);
  expect(section.querySelector('[style*="translateX(50px)"]')).not.toBeNull();
  for (let parent = section.parentElement; parent; parent = parent.parentElement) {
    expect(parent.className).not.toMatch(/overflow-(?:hidden|clip|x-hidden|x-clip)/);
  }
});
