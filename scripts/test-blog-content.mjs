import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const base = fileURLToPath(new URL('../src/data/blog-posts', import.meta.url));
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  }}).outputText;
  const compiledModule = { exports: {} };
  cache.set(file, compiledModule.exports);
  vm.runInNewContext(code, { exports: compiledModule.exports, module: compiledModule, require: (name) => {
    assert.ok(name.startsWith('.'), `Unexpected runtime dependency ${name}`);
    return load(path.resolve(path.dirname(file), `${name}.ts`));
  }}, { filename: file });
  return compiledModule.exports;
}
const nl = load(path.join(base, 'index.ts')).blogPosts;
const en = load(path.join(base, 'en/index.ts')).blogPostsEn;
const all = [...nl, ...en];
assert.ok(nl.some(p => p.slug === 'inp-core-web-vitals'), 'New Dutch article must be registered');
assert.ok(en.some(p => p.slug === 'inp-core-web-vitals-explained'), 'New English article must be registered');
assert.equal(new Set(all.map(p => p.slug)).size, all.length, 'Slugs must be unique');
assert.equal(new Set(all.map(p => p.id)).size, all.length, 'IDs must be unique');
for (const p of all) {
  for (const key of ['id','title','excerpt','content','author','publishedAt','updatedAt','category','image','slug']) {
    assert.equal(typeof p[key], 'string', `${p.slug}: ${key}`);
    assert.ok(p[key].trim(), `${p.slug}: empty ${key}`);
  }
  assert.match(p.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(p.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  if (p.originalPublishedAt !== undefined) {
    assert.match(p.originalPublishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!Number.isNaN(Date.parse(p.originalPublishedAt)), `${p.slug}: invalid factual publication date`);
  }
  assert.ok(p.updatedAt >= p.publishedAt, `${p.slug}: update before publication`);
  assert.ok(Array.isArray(p.tags) && p.tags.length > 0);
  assert.ok(Number.isInteger(p.readTime) && p.readTime > 0);
  const counterpart = all.find(q => q.slug === p.translationSlug);
  assert.ok(counterpart, `${p.slug}: missing translation`);
  assert.equal(counterpart.translationSlug, p.slug);
  assert.notEqual(counterpart.lang, p.lang);
  assert.equal(counterpart.publishedAt, p.publishedAt, `${p.slug}: translation schedule mismatch`);
  assert.equal(counterpart.originalPublishedAt, p.originalPublishedAt, `${p.slug}: translation history mismatch`);
  assert.equal(counterpart.updatedAt, p.updatedAt, `${p.slug}: translation revision mismatch`);
}
for (const slug of ['inp-core-web-vitals', 'inp-core-web-vitals-explained']) {
  const p = all.find(q => q.slug === slug);
  const sourceUrls = (p.content.match(/https:\/\/[^\s]+/g) ?? []).map(value => new URL(value));
  assert.ok(sourceUrls.some(url => url.href === 'https://web.dev/articles/inp'));
  assert.ok(sourceUrls.some(url => url.href === 'https://developers.google.com/search/docs/appearance/core-web-vitals'));
  assert.ok(!p.content.includes('Status:') && !p.content.includes('Publication checklist:'));
}
const imageOwners = new Map();
for (const p of all) {
  const owner = [p.slug, p.translationSlug].sort().join('|');
  const url = new URL(p.image, 'https://www.intrict.com');
  const identities = [`${url.origin}${url.pathname}`];
  if (p.image.startsWith('/')) {
    assert.match(p.image, /^\/images\/blog\/[a-z0-9-]+\.(?:webp|png|jpe?g|avif)$/);
    const asset = fileURLToPath(new URL(`../public${p.image}`, import.meta.url));
    assert.ok(fs.existsSync(asset), `${p.slug}: missing local illustration`);
    identities.push(createHash('sha256').update(fs.readFileSync(asset)).digest('hex'));
  }
  for (const identity of identities) {
    assert.ok(!imageOwners.has(identity) || imageOwners.get(identity) === owner,
      `${p.slug}: image reused by another article (${imageOwners.get(identity)})`);
    imageOwners.set(identity, owner);
  }
}
console.log(`Content checks passed: ${nl.length} NL, ${en.length} EN; unique IDs/slugs/images and reciprocal translations.`);
