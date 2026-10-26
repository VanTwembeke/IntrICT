import React from 'react';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import Header from '../src/components/common/Header';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
let lang = 'nl';
let pathname = '/';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang, t: lang === 'nl' ? nl : en, setLang: vi.fn() }) }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } }) }));
vi.mock('@/hooks/useMessages', () => ({ useMessages: () => ({ conversations: [], unreadCount: 0, loading: false, markAsRead: vi.fn() }) }));
afterEach(() => { cleanup(); pathname = '/'; Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 }); });
for (const locale of ['nl', 'en']) test(`${locale}: scrolled header shortcut uses readable text and preserves search`, async () => {
  lang = locale;
  const { container } = render(React.createElement(Header));
  const kbd = container.querySelector('header kbd');
  expect(kbd.textContent).toMatch(/Ctrl\+K|⌘K/);
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 });
  fireEvent.scroll(window);
  expect(kbd.classList.contains('text-slate-600')).toBe(true);
  expect(kbd.classList.contains('bg-slate-100')).toBe(true);
  fireEvent.click(kbd.closest('button'));
  expect(container.querySelector('input').placeholder).toBe((locale === 'nl' ? nl : en).header.searchPlaceholder);
  fireEvent.keyDown(window, { key: 'Escape' });
  await waitFor(() => expect(container.querySelector('input')).toBeNull());
});

for (const locale of ['nl', 'en']) test(`${locale}: search palette secondary text stays readable across states`, async () => {
  lang = locale;
  const { container } = render(React.createElement(Header));
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  const input = container.querySelector('input');
  expect(input.placeholder).toBe((locale === 'nl' ? nl : en).header.searchPlaceholder);
  expect(input.classList.contains('placeholder:text-slate-600')).toBe(true);
  const panel = input.parentElement.parentElement;
  expect([...panel.querySelectorAll('p, kbd')].filter(e => e.classList.contains('text-slate-600')).length).toBeGreaterThan(3);
  expect(panel.querySelector('.text-slate-400')).toBeNull();
  expect(panel.querySelector('[class*="text-[11px]"]').classList.contains('text-slate-600')).toBe(true);
  fireEvent.change(input, { target: { value: 'zzzzzzzzzzzzzzzz' } });
  expect(panel.textContent).toContain((locale === 'nl' ? nl : en).header.noResults);
  expect(panel.querySelector('p').classList.contains('text-slate-600')).toBe(true);
  fireEvent.keyDown(window, { key: 'Escape' });
  await waitFor(() => expect(container.querySelector('input')).toBeNull());
});

for (const locale of ['nl', 'en']) {
  test(`${locale}: exact blog archive has stable light header at top and after scrolling`, async () => {
    lang = locale;
    pathname = '/blog';
    const { container, getByRole } = render(React.createElement(Header));
    await waitFor(() => expect(getByRole('button', { name: (locale === 'nl' ? nl : en).header.login })).toBeTruthy());
    const assertLight = () => {
      const header = container.querySelector('header');
      expect(header.classList.contains('bg-white/92')).toBe(true);
      expect(header.querySelector('a[href="/blog"]').classList.contains('text-slate-900')).toBe(true);
      expect(header.querySelector('a[href="/portfolio"]').classList.contains('text-slate-600')).toBe(true);
      expect(header.querySelector('a[href="/"] svg').innerHTML).toContain('#2B2F43');
      expect(header.querySelector('kbd').classList.contains('text-slate-600')).toBe(true);
      expect(header.querySelector('kbd').closest('button').classList.contains('text-slate-600')).toBe(true);
      const languageButtons = [...header.querySelectorAll('button')].filter(e => ['nl','en'].includes(e.textContent.trim()));
      expect(languageButtons.find(e => e.textContent.trim() === locale).classList.contains('text-slate-900')).toBe(true);
      expect(languageButtons.find(e => e.textContent.trim() !== locale).classList.contains('text-slate-600')).toBe(true);
      expect(getByRole('button', { name: (locale === 'nl' ? nl : en).header.login }).classList.contains('text-slate-600')).toBe(true);
      expect(getByRole('button', { name: (locale === 'nl' ? nl : en).header.menuOpen }).classList.contains('text-slate-700')).toBe(true);
    };
    assertLight();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 });
    fireEvent.scroll(window);
    assertLight();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    fireEvent.scroll(window);
    assertLight();
  });
  for (const route of ['/', '/blog/sme-website-image-loading-order']) test(`${locale}: ${route} retains dark hero and real scroll transitions`, () => {
    lang = locale;
    pathname = route;
    const { container } = render(React.createElement(Header));
    const header = container.querySelector('header');
    expect(header.classList.contains('bg-black/20')).toBe(true);
    expect(header.querySelector('a[href="/"] svg').innerHTML).toContain('#ffffff');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 600 });
    fireEvent.scroll(window);
    expect(header.classList.contains('bg-white/92')).toBe(true);
    expect(header.querySelector('kbd').closest('button').classList.contains('text-slate-600')).toBe(true);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(header.classList.contains('bg-black/20')).toBe(true);
  });
}
