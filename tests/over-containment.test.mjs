import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Over from '../src/app/over/OverClient';
import nl from '../src/i18n/nl';
import en from '../src/i18n/en';
let lang = 'nl';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ t: lang === 'en' ? en : nl }) }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', () => 0);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
for (const locale of ['nl', 'en']) test(`${locale}: story owns horizontal entrance containment without a page-wide mask`, () => {
  lang = locale;
  const t = locale === 'en' ? en : nl;
  render(React.createElement(Over));
  const story = screen.getByText(t.about.storyHeading).closest('section');
  expect(story.classList.contains('overflow-x-clip')).toBe(true);
  expect(story.classList.contains('overflow-hidden')).toBe(false);
  expect(story.classList.contains('overflow-y-hidden')).toBe(false);
  expect(story.querySelector('[style*="translateX(50px)"]')).not.toBeNull();
  expect(screen.getByText(t.about.storyCard1Title).closest('section')).toBe(story);
  for (let parent = story.parentElement; parent; parent = parent.parentElement) {
    expect(parent.className).not.toMatch(/overflow-(?:hidden|clip|x-hidden|x-clip)/);
  }
});
