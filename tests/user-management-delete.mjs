import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sourcePath = new URL('../src/lib/user-management.ts', import.meta.url);
async function handler() {
  assert.ok(fs.existsSync(sourcePath), 'Safe deletion handler must exist');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return (await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)).handleUserDeletion;
}
const actor = '11111111-1111-4111-8111-111111111111';
const target = '22222222-2222-4222-8222-222222222222';
function request(id = target, body = { confirmationId: id }, headers = {}) {
  return new Request(`https://www.intrict.com/api/admin/users/${id}`, {
    method: 'DELETE', headers: { origin: 'https://www.intrict.com', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
}
function store(overrides = {}) {
  return {
    getCaller: async () => ({ data: { id: actor }, error: null }),
    getCallerProfile: async () => ({ data: { role: 'admin' }, error: null }),
    getTargetProfile: async () => ({ data: { id: target, role: 'user' }, error: null }),
    getTargetAuth: async () => ({ data: { id: target, app_metadata: {} }, error: null }),
    ...overrides,
  };
}
test('retention cannot be proven: return explicit blocker, never hidden deletion', async () => {
  const run = await handler();
  const result = await run(request(), target, store());
  assert.equal(result.status, 409);
  assert.equal((await result.json()).code, 'RETENTION_REVIEW_REQUIRED');
});
for (const [name, overrides, id, status] of [
  ['unauthenticated', { getCaller: async () => ({ data: null, error: null }) }, target, 401],
  ['non-admin', { getCallerProfile: async () => ({ data: { role: 'user' }, error: null }) }, target, 403],
  ['self deletion', {}, actor, 403],
  ['admin target', { getTargetProfile: async () => ({ data: { role: 'admin' }, error: null }) }, target, 403],
  ['auth metadata admin target', { getTargetAuth: async () => ({ data: { id: target, app_metadata: { role: 'admin' } }, error: null }) }, target, 403],
  ['missing target', { getTargetProfile: async () => ({ data: null, error: null }) }, target, 404],
  ['missing auth target', { getTargetAuth: async () => ({ data: null, error: null }) }, target, 404],
  ['caller datastore failure', { getCallerProfile: async () => ({ data: null, error: new Error('private DB failure') }) }, target, 503],
  ['target datastore failure', { getTargetProfile: async () => ({ data: null, error: new Error('private DB failure') }) }, target, 503],
  ['auth datastore failure', { getTargetAuth: async () => ({ data: null, error: new Error('private DB failure') }) }, target, 503],
  ['thrown datastore failure', { getTargetProfile: async () => { throw new Error('private DB failure'); } }, target, 503],
]) {
  test(`reject ${name}`, async () => {
    const result = await (await handler())(request(id), id, store(overrides));
    assert.equal(result.status, status);
    assert.doesNotMatch(await result.text(), /private DB failure/);
  });
}
for (const [name, req, id, status] of [
  ['wrong confirmation', request(target, { confirmationId: actor }), target, 400],
  ['missing confirmation', request(target, {}), target, 400],
  ['unexpected destructive option', request(target, { confirmationId: target, hardDelete: true }), target, 400],
  ['invalid UUID', request('sir at'), 'sir at', 400],
  ['cross origin', request(target, undefined, { origin: 'https://intrict.com.evil.example' }), target, 403],
  ['sibling origin', request(target, undefined, { origin: 'https://other.intrict.com' }), target, 403],
  ['null origin', request(target, undefined, { origin: 'null' }), target, 403],
  ['cross-site fetch', request(target, undefined, { 'sec-fetch-site': 'cross-site' }), target, 403],
  ['bad content type', request(target, undefined, { 'content-type': 'text/plain' }), target, 415],
  ['malformed JSON', new Request('https://www.intrict.com/api/admin/users/' + target, { method: 'DELETE', headers: { origin: 'https://www.intrict.com', 'content-type': 'application/json' }, body: '{' }), target, 400],
  ['oversized body', request(target, { confirmationId: target, padding: 'x'.repeat(9000) }), target, 413],
]) {
  test(`reject ${name}`, async () => {
    const result = await (await handler())(req, id, store());
    assert.equal(result.status, status);
  });
}
test('missing Origin rejected before datastore access', async () => {
  const req = request(); req.headers.delete('origin');
  const result = await (await handler())(req, target, store({ getCaller: async () => { throw new Error('must not run'); } }));
  assert.equal(result.status, 403);
});
