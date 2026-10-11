import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const actor = '11111111-1111-4111-8111-111111111111';
const target = '22222222-2222-4222-8222-222222222222';
const until = '2126-01-01T00:00:00.000Z';
async function handlers() {
  const source = fs.readFileSync(new URL('../src/lib/user-management.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
function request(id = target, body = { confirmationId: id }, headers = {}, method = 'POST') {
  return new Request(`https://www.intrict.com/api/admin/users/${id}/access`, { method, headers: { origin: 'https://www.intrict.com', 'content-type': 'application/json', ...headers }, ...(method === 'POST' && { body: JSON.stringify(body) }) });
}
function store(overrides = {}) {
  let reads = 0;
  const mutations = [];
  return {
    mutations,
    getCaller: async () => ({ data: { id: actor }, error: null }),
    getCallerProfile: async () => ({ data: { role: 'admin' }, error: null }),
    getTargetProfile: async () => ({ data: { id: target, role: 'user' }, error: null }),
    getTargetAuth: async () => ({ data: { id: target, email: 'secret@example.test', app_metadata: { provider: 'email', custom: 'preserve' }, banned_until: reads++ ? until : null }, error: null }),
    banTarget: async (id, attributes) => { mutations.push({ id, attributes }); return { data: { id }, error: null }; },
    ...overrides,
  };
}
test('authenticated status readback exposes only exact-target access status', async () => {
  const { handleUserAccessStatus } = await handlers();
  assert.equal(typeof handleUserAccessStatus, 'function', 'readback handler must exist');
  const s = store({ getTargetAuth: async () => ({ data: { id: target, banned_until: until, email: 'secret@example.test', app_metadata: { role: 'user' } }, error: null }) });
  const response = await handleUserAccessStatus(request(target, undefined, {}, 'GET'), target, s);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: target, status: 'disabled_not_deleted', banned_until: until });
  assert.deepEqual(s.mutations, []);
});
for (const [name, overrides, id, expected] of [
  ['unauthenticated', { getCaller: async () => ({ data: null, error: null }) }, target, 401],
  ['non-admin', { getCallerProfile: async () => ({ data: { role: 'user' }, error: null }) }, target, 403],
  ['self', {}, actor, 403],
  ['admin', { getTargetProfile: async () => ({ data: { id: target, role: 'admin' }, error: null }) }, target, 403],
  ['unknown role', { getTargetProfile: async () => ({ data: { id: target, role: 'owner' }, error: null }) }, target, 403],
  ['auth admin', { getTargetAuth: async () => ({ data: { id: target, app_metadata: { role: 'admin' } }, error: null }) }, target, 403],
  ['wrong profile', { getTargetProfile: async () => ({ data: { id: actor, role: 'user' }, error: null }) }, target, 503],
  ['wrong auth', { getTargetAuth: async () => ({ data: { id: actor }, error: null }) }, target, 503],
  ['missing profile', { getTargetProfile: async () => ({ data: null, error: null }) }, target, 404],
  ['missing auth', { getTargetAuth: async () => ({ data: null, error: null }) }, target, 404],
  ['datastore failure', { getTargetProfile: async () => { throw new Error('private-secret'); } }, target, 503],
]) {
  test(`POST and GET reject ${name} without mutation or leakage`, async () => {
    const h = await handlers();
    for (const method of ['POST', 'GET']) {
      const s = store(overrides);
      const run = method === 'POST' ? h.handleUserAccessRevocation : h.handleUserAccessStatus;
      assert.equal(typeof run, 'function');
      const response = await run(request(id, undefined, {}, method), id, s);
      assert.equal(response.status, expected);
      assert.doesNotMatch(await response.text(), /private-secret|secret@example/);
      assert.deepEqual(s.mutations, []);
    }
  });
}
for (const [name, req, expected] of [
  ['cross-origin', () => request(target, undefined, { origin: 'https://evil.test' }), 403],
  ['missing origin', () => { const r = request(); r.headers.delete('origin'); return r; }, 403],
  ['cross-site', () => request(target, undefined, { 'sec-fetch-site': 'cross-site' }), 403],
  ['invalid UUID', () => request('invalid'), 400],
  ['wrong confirmation', () => request(target, { confirmationId: actor }), 400],
  ['extra fields', () => request(target, { confirmationId: target, hardDelete: true }), 400],
  ['oversized', () => request(target, { confirmationId: target, padding: 'x'.repeat(9000) }), 413],
  ['content-type', () => request(target, undefined, { 'content-type': 'text/plain' }), 415],
  ['malformed JSON', () => new Request(request().url, { method: 'POST', headers: request().headers, body: '{' }), 400],
]) {
  test(`reject ${name} before datastore access`, async () => {
    const s = store({ getCaller: async () => { throw new Error('must-not-read'); } });
    const response = await (await handlers()).handleUserAccessRevocation(req(), new URL(req().url).pathname.split('/').at(-2), s);
    assert.equal(response.status, expected);
    assert.deepEqual(s.mutations, []);
  });
}
for (const [name, readback] of [
  ['not banned', { data: { id: target }, error: null }],
  ['expired', { data: { id: target, banned_until: '2000-01-01' }, error: null }],
  ['invalid expiry', { data: { id: target, banned_until: 'invalid' }, error: null }],
  ['wrong ID', { data: { id: actor, banned_until: until }, error: null }],
  ['failed readback', { data: null, error: new Error('private-secret') }],
]) {
  test(`never claim success for ${name} readback`, async () => {
    let reads = 0;
    const s = store({ getTargetAuth: async () => reads++ ? readback : { data: { id: target }, error: null } });
    const response = await (await handlers()).handleUserAccessRevocation(request(), target, s);
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.code, 'REVOCATION_UNVERIFIED');
    assert.doesNotMatch(body.error, /private-secret|Er is niets gewijzigd/);
  });
}
test('write exception is uncertain, not a claim of unchanged data', async () => {
  const s = store({ banTarget: async () => { throw new Error('private-secret'); } });
  const response = await (await handlers()).handleUserAccessRevocation(request(), target, s);
  assert.equal((await response.json()).code, 'REVOCATION_UNVERIFIED');
});

for (const [name, result] of [
  ['provider error', { data: null, error: new Error('private-secret') }],
  ['wrong updated ID', { data: { id: actor }, error: null }],
  ['empty update', { data: null, error: null }],
]) {
  test(`write ${name} never returns success`, async () => {
    const s = store({ banTarget: async () => result });
    const response = await (await handlers()).handleUserAccessRevocation(request(), target, s);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'REVOCATION_UNVERIFIED');
  });
}
for (const [name, headers, expected] of [
  ['same-origin browser without Origin', { 'sec-fetch-site': 'same-origin' }, 200],
  ['cross-site', { 'sec-fetch-site': 'cross-site' }, 403],
  ['cross-origin', { origin: 'https://evil.test' }, 403],
  ['missing origin and site', {}, 403],
]) {
  test(`GET status ${name}`, async () => {
    const req = new Request(`https://www.intrict.com/api/admin/users/${target}/access`, { headers });
    const response = await (await handlers()).handleUserAccessStatus(req, target, store());
    assert.equal(response.status, expected);
    if (expected === 200) assert.deepEqual(await response.json(), { id: target, status: 'not_disabled', banned_until: null });
  });
}
test('access revocation bans only exact Auth target and succeeds only after readback', async () => {
  const s = store();
  const { handleUserAccessRevocation } = await handlers();
  assert.equal(typeof handleUserAccessRevocation, 'function', 'access revocation handler must exist');
  const response = await handleUserAccessRevocation(request(), target, s);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: target, status: 'disabled_not_deleted', banned_until: until });
  assert.deepEqual(s.mutations, [{ id: target, attributes: { ban_duration: '876000h' } }]);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
