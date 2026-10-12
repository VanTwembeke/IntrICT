import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import nl from '../src/i18n/nl';
import BlogClient from '../src/app/blog/BlogClient';
import BlogPostClient from '../src/app/blog/[slug]/BlogPostClient';
import { blogPostsNl, blogPostsEn } from '../src/lib/blog-api';
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ lang: 'nl', t: nl }) }));
vi.mock('@/components/common/Header', () => ({ default: () => null }));
vi.mock('@/components/common/Footer', () => ({ default: () => null }));
vi.mock('@/components/common/BackToTop', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), notFound: vi.fn() }));
vi.mock('next/image', () => ({ default: ({ fill, priority, ...props }) => { void fill; void priority; return React.createElement('img', props); } }));
vi.mock('lenis', () => ({ default: class { raf() {} destroy() {} } }));
vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.stubGlobal('requestAnimationFrame', () => 0);
test('existing article markdown renders headings, prose, links, blockquotes, tables and fenced code without executing HTML', () => {
  const { container } = article('## **Section**\n### Detail\n**Summary:** [Docs](https://web.dev/articles/inp) and `INP`.\n> **Quote** with [a link](/contact)\n\n| Metric | Detail |\n| --- | --- |\n| INP | **Response** |\n\n```html\n<img src=x onerror=alert(1)>\n```\n\n<script>alert(1)</script>\n[Unsafe](javascript:alert(1))\n[Data](data:text/html,test)\n[Mail](mailto:hello@example.com)\n[Phone](tel:+32123456789)');
  const prose = container.querySelector('.prose');
  expect(prose.querySelector('h2 strong')?.textContent).toBe('Section');
  expect(prose.querySelector('h3').textContent).toBe('Detail');
  expect(prose.querySelector('p strong')?.textContent).toBe('Summary:');
  expect(prose.querySelector('blockquote strong')?.textContent).toBe('Quote');
  expect(prose.querySelector('blockquote a')?.getAttribute('href')).toBe('/contact');
  expect(prose.querySelector('table tbody strong')?.textContent).toBe('Response');
  expect(prose.querySelector('pre code').textContent).toBe('<img src=x onerror=alert(1)>');
  expect(prose.querySelector('script, img, [href^="javascript:"], [href^="data:"]')).toBeNull();
  expect(prose.querySelector('a[href^="mailto:"]')).toBeTruthy();
  expect(prose.querySelector('a[href^="tel:"]')).toBeTruthy();
});

test('long source URLs and headings may wrap inside the article without clipping the document', () => {
  const { container } = article(blogPostsNl.find(p => p.slug === 'inp-core-web-vitals').content);
  const prose = container.querySelector('.prose');
  expect(prose.className).toContain('[overflow-wrap:anywhere]');
  expect(prose.className).not.toContain('overflow-hidden');
});

test.each([...blogPostsNl, ...blogPostsEn].map(post => [post.slug, post]))('%s: real article fixtures retain lists, tables, code and one hero title', (_slug, post) => {
  const { container } = render(React.createElement(BlogPostClient, { initialPost: post, initialRelatedPosts: [] }));
  const prose = container.querySelector('.prose');
  expect(container.querySelectorAll('h1')).toHaveLength(1);
  const lines = post.content.split('\n');
  // Ignore code fences when counting prose constructs.
  let fenced = false;
  const proseLines = lines.filter(line => { if (line.startsWith('```')) { fenced = !fenced; return false; } return !fenced; });
  const listLines = proseLines.filter(line => /^(?:- |\d+\. )/.test(line));
  expect(prose.querySelectorAll('li')).toHaveLength(listLines.length);
  expect([...prose.querySelectorAll('li')].every(e => ['UL','OL'].includes(e.parentElement.tagName))).toBe(true);
  expect(prose.querySelectorAll('pre')).toHaveLength(lines.filter(line => line.startsWith('```')).length / 2);
  expect(prose.querySelectorAll('table')).toHaveLength(proseLines.filter(line => /^\|[\s|:-]+\|/.test(line)).length);
  for (const element of prose.querySelectorAll('li, p, h2, h3, td')) {
    if (!element.closest('pre')) expect(element.textContent).not.toContain('**');
  }
});

for (const href of ['https://web.dev/articles/inp', 'http://example.com/path', '/contact', '#section', '?topic=inp', 'mailto:hello@example.com', 'tel:+32123456789']) {
  test(`safe inline destination accepted unchanged: ${href}`, () => {
    const { container } = article(`- [Read](${href})`);
    expect(container.querySelector('.prose a')?.getAttribute('href')).toBe(href);
  });
}
for (const href of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test', 'vbscript:msgbox(1)', 'file:///etc/passwd', 'javascript&#58;alert(1)']) {
  test(`inline destination cannot execute: ${href}`, () => {
    const { container } = article(`- [Read](${href})\n<img src=x onerror=alert(1)>`);
    const prose = container.querySelector('.prose');
    expect(prose.querySelector('a[href^="javascript:"], a[href^="data:"], a[href^="vbscript:"], a[href^="file:"], img')).toBeNull();
  });
}

test('blog index small metadata and tags use readable contrast on light cards', () => {
  const { container } = render(React.createElement(BlogClient));
  const metadata = container.querySelectorAll('article span.flex.text-xs');
  expect(metadata.length).toBeGreaterThan(0);
  for (const span of metadata) expect(span.className).not.toContain('text-slate-400');
  const tags = container.querySelectorAll('article span.bg-slate-50');
  expect(tags.length).toBeGreaterThan(0);
  for (const tag of tags) expect(tag.className).not.toContain('text-slate-400');
});

afterEach(cleanup);
function article(content, related = []) {
  return render(React.createElement(BlogPostClient, { initialPost: { ...blogPostsNl[0], content }, initialRelatedPosts: related }));
}
test('consecutive bullets and numbered items form separate semantic lists with formatted item content', () => {
  const { container } = article('- **First:** [Docs](https://web.dev/)\n- Second\n\nParagraph\n\n3. **Third**\n4. Fourth\n\n- Last');
  const prose = container.querySelector('.prose');
  expect([...prose.querySelectorAll('ul, ol')].map(e => e.tagName)).toEqual(['UL', 'OL', 'UL']);
  expect([...prose.querySelectorAll('ul, ol')].map(e => e.children.length)).toEqual([2, 2, 1]);
  expect(prose.querySelector('ol').getAttribute('start')).toBe('3');
  expect([...prose.querySelectorAll('li')].every(e => ['UL','OL'].includes(e.parentElement.tagName))).toBe(true);
  expect(prose.querySelector('li strong').textContent).toBe('First:');
  expect(prose.querySelector('li a').getAttribute('href')).toBe('https://web.dev/');
});

test('code scroll regions are named, keyboard focusable and visibly focused', () => {
  const { container } = article('```javascript\nconst a = 1;\n```');
  const scroll = container.querySelector('pre').parentElement;
  expect(scroll.tabIndex).toBe(0);
  expect(scroll.getAttribute('role')).toBe('region');
  expect(scroll.getAttribute('aria-label')).toMatch(/javascript/);
  expect(scroll.className).toContain('focus-visible:ring-2');
  expect(scroll.className).toContain('focus-visible:ring-blue-400');
});

test('white category badges use AA blue and the author link stays underlined', () => {
  const { container } = article('Text', [blogPostsNl[1]]);
  const badges = [...container.querySelectorAll('span.text-white')].filter(e => e.textContent === blogPostsNl[0].category || e.textContent === blogPostsNl[1].category);
  expect(badges).toHaveLength(2);
  for (const badge of badges) expect(badge.className).toContain('bg-blue-700');
  const linkedin = container.querySelector('a[href="https://www.linkedin.com/in/VanTwembeke"]');
  expect(linkedin.className.split(' ')).toContain('underline');
});

