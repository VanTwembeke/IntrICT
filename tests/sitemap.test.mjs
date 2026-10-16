import { expect, test } from 'vitest';
import sitemap from '../src/app/sitemap';

const siteUrl = 'https://www.intrict.com';
const undatedPaths = [
  '/over', '/portfolio', '/oplossingen', '/visie', '/contact',
  '/privacy', '/voorwaarden', '/cookies', '/gdpr',
];

test('static pages without verified modification metadata omit lastModified rather than inventing dates', () => {
  const entries = sitemap();
  for (const path of undatedPaths) {
    const entry = entries.find(item => item.url === siteUrl + path);
    expect(entry, path).toBeDefined();
    expect(entry, path).not.toHaveProperty('lastModified');
  }
});
