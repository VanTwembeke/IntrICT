// @vitest-environment node
import { beforeEach, expect, test, vi } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
vi.mock('server-only', () => ({}));
const keys = generateKeyPairSync('ed25519');
const mocks = vi.hoisted(() => ({ admin: vi.fn(), verify: vi.fn() }));
vi.mock('../src/lib/supabase/admin', () => ({ createAdminClient: mocks.admin }));
vi.mock('node:crypto', async (original) => {
  const actual = await original();
  return { ...actual, verify: (...args) => mocks.verify(...args) };
});
const owner = '11111111-1111-4111-8111-111111111111';
const origin = 'https://www.intrict.com';
const path = '/api/monitor/requests';
const request = (query = 'source=package_requests', options = {}) => {
  const timestamp = options.timestamp ?? String(Math.floor(Date.now() / 1000));
  const target = options.signedQuery ?? query;
  const signature = sign(null, Buffer.from(`GET\n${origin}\n${path}${target ? `?${target}` : ''}\n${timestamp}`), keys.privateKey).toString('base64');
  return new Request(`${options.origin ?? origin}${path}?${query}`, { headers: { 'X-Intrict-Monitor-Timestamp': timestamp, 'X-Intrict-Monitor-Signature': options.signature ?? signature, cookie: 'ignored=session' } });
};
beforeEach(async () => {
  mocks.admin.mockReset(); mocks.verify.mockReset();
  const actual = await vi.importActual('node:crypto');
  mocks.verify.mockImplementation((algorithm, data, publicKey, signature) => {
    expect(publicKey).toContain('86D/0laGkpp4sdUWSf4Q138LmGcspdI/zhx92EJo9FE=');
    return actual.verify(algorithm, data, keys.publicKey, signature);
  });
});
test('authenticates exact signed GET target, rejects replay outside 60 seconds and never uses cookies', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  for (const req of [
    new Request(`${origin}${path}?source=package_requests`, { headers: { cookie: 'admin=true' } }),
    request(undefined, { signature: 'invalid' }),
    request(undefined, { timestamp: String(Math.floor(Date.now() / 1000) - 61) }),
    request(undefined, { timestamp: String(Math.floor(Date.now() / 1000) + 61) }),
    request('source=appointments', { signedQuery: 'source=package_requests' }),
    request(undefined, { origin: 'https://evil.test' }),
  ]) {
    const response = await GET(req);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('set-cookie')).toBeNull();
  }
  expect(mocks.admin).not.toHaveBeenCalled();
  expect((await GET(request())).status).toBe(503); // authenticated; absent DB fails closed
  expect(mocks.admin).toHaveBeenCalledOnce();
});

test('rejects ambiguous, unknown or invalid signed parameters before database access', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  for (const query of ['', 'source=other', 'source=messages&source=appointments', 'source=messages&limit=0', 'source=messages&limit=501', 'source=messages&limit=1.5', 'source=messages&after=not-uuid', 'source=messages&after=', 'source=messages&since=2026-01-01', 'source=messages&limit=2&limit=3']) {
    expect((await GET(request(query))).status, query).toBe(400);
  }
  expect(mocks.admin).not.toHaveBeenCalled();
});

// Fake only the external PostgREST boundary; query/filter/projection behavior is exercised.
function database(tables = {}, ownerResult = { data: { id: owner, role: 'admin' }, error: null }, sourceResult) {
  const calls = [];
  const from = vi.fn(table => {
    const filters = []; let maximum = Infinity; let ordered = false;
    const builder = {
      select(value, options) { calls.push([table, 'select', value, ...(options ? [options] : [])]); return builder; },
      eq(field, value) { filters.push(['eq', field, value]); calls.push([table, 'eq', field, value]); return builder; },
      neq(field, value) { filters.push(['neq', field, value]); calls.push([table, 'neq', field, value]); return builder; },
      gt(field, value) { filters.push(['gt', field, value]); calls.push([table, 'gt', field, value]); return builder; },
      order(field, options) { expect(field).toBe('id'); expect(options).toEqual({ ascending: true }); ordered = true; return builder; },
      limit(value) { maximum = value; calls.push([table, 'limit', value]); return builder; },
      single: async () => ownerResult,
      then(resolve, reject) {
        if (sourceResult instanceof Error) return Promise.reject(sourceResult).then(resolve, reject);
        if (sourceResult) return Promise.resolve(sourceResult).then(resolve);
        let rows = [...(tables[table] ?? [])];
        for (const [op, field, value] of filters) rows = rows.filter(row => {
          const actual = field === 'conversations.conversation_participants.profile_id' ? row.participant : row[field];
          return op === 'eq' ? actual === value : op === 'neq' ? actual !== value : actual > value;
        });
        if (ordered) rows.sort((a, b) => a.id.localeCompare(b.id));
        return Promise.resolve({ data: rows.slice(0, maximum), count: rows.length, error: null }).then(resolve);
      },
    };
    return builder;
  });
  mocks.admin.mockReturnValue({ from });
  return { calls, from };
}

test('requires a unique exact-email admin owner before any source access, hides owner/database errors', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  for (const result of [{ data: null, error: null }, { data: { id: owner, role: 'user' }, error: null }, { data: { id: 'invalid', role: 'admin' }, error: null }, { data: null, error: { message: 'private db details' } }]) {
    const db = database({}, result);
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Monitor unavailable' });
    expect(db.from.mock.calls).toEqual([['profiles']]);
    expect(db.calls).toEqual([['profiles', 'select', 'id,role'], ['profiles', 'eq', 'email', 'jonas@intrict.com']]);
  }
});

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const created = '2026-01-01T00:00:00Z';
test('returns only request/appointment metadata including guests, no profile joins or mutations', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  for (const source of ['package_requests', 'appointments']) {
    const metadata = { id: id(1), status: 'pending', created_at: created, updated_at: created, ...(source === 'appointments' ? { starts_at: created, ends_at: created } : {}) };
    const db = database({ [source]: [{ ...metadata, user_id: null, guest_email: 'private@example.test', notes: 'private', package_price: 500 }] });
    const response = await GET(request(`source=${source}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ source, records: [metadata], next_cursor: null, complete: true });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(db.calls.filter(c => c[0] === source)).toEqual([
      [source, 'select', source === 'appointments' ? 'id,status,created_at,updated_at,starts_at,ends_at' : 'id,status,created_at,updated_at', { count: 'exact' }],
      [source, 'limit', 100],
    ]);
  }
});

test('keyset walks every ID deterministically, reconciles status changes without updated_at changes', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  const rows = [3, 1, 2, 4, 5].map(n => ({ id: id(n), status: 'pending', created_at: created, updated_at: created }));
  const db = database({ package_requests: rows });
  const collected = []; let after = null;
  do {
    const response = await GET(request(`source=package_requests&limit=2${after ? `&after=${after}` : ''}`));
    expect(response.status).toBe(200);
    const page = await response.json();
    collected.push(...page.records.map(r => r.id));
    expect(page.complete).toBe(page.next_cursor === null);
    after = page.next_cursor;
    if (collected.length > 5) throw new Error('non-advancing pagination');
  } while (after);
  expect(collected).toEqual([1, 2, 3, 4, 5].map(id));
  expect(db.calls).toContainEqual(['package_requests', 'gt', 'id', id(2)]);
  expect(db.calls).toContainEqual(['package_requests', 'gt', 'id', id(4)]);
  rows.find(r => r.id === id(1)).status = 'accepted';
  const reconciled = await (await GET(request('source=package_requests&limit=5'))).json();
  expect(reconciled.records[0].status).toBe('accepted');
  expect(reconciled.complete).toBe(true); // exact page boundary, not an assumed max-record cutoff
  expect(await (await GET(request(`source=package_requests&after=${id(9)}`))).json()).toEqual({ source: 'package_requests', records: [], complete: true, next_cursor: null });
});

test('enumerates every incoming message only in owner-participant conversations, never marks read', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  const incoming = [1, 2, 3].map(n => ({ id: id(n), conversation_id: id(100), created_at: created, read_at: null }));
  const db = database({ messages: [
    ...incoming.map(r => ({ ...r, sender_id: id(50), participant: owner, content: 'private', conversations: { conversation_participants: [{ profile_id: owner }] } })),
    { ...incoming[0], id: id(4), participant: owner, sender_id: owner },
    { ...incoming[0], id: id(5), participant: id(90), sender_id: id(50) },
  ] });
  const first = await (await GET(request('source=messages&limit=2'))).json();
  expect(first).toEqual({ source: 'messages', records: incoming.slice(0, 2), next_cursor: id(2), complete: false });
  const second = await (await GET(request(`source=messages&limit=2&after=${id(2)}`))).json();
  expect(second).toEqual({ source: 'messages', records: incoming.slice(2), next_cursor: null, complete: true });
  expect(db.calls).toContainEqual(['messages', 'select', 'id,conversation_id,created_at,read_at,conversations!inner(conversation_participants!inner(profile_id))', { count: 'exact' }]);
  expect(db.calls).toContainEqual(['messages', 'eq', 'conversations.conversation_participants.profile_id', owner]);
  expect(db.calls).toContainEqual(['messages', 'neq', 'sender_id', owner]);
});

test('treats DB errors, missing counts and malformed/nonadvancing pages as unknown, never complete', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  const row = { id: id(1), status: 'pending', created_at: created, updated_at: created };
  for (const result of [
    new Error('private details'), { data: null, error: { message: 'private details' }, count: null },
    { data: [row], count: undefined }, { data: [row], count: null }, { data: [], count: 1 },
    { data: [row], count: -1 }, { data: [row], count: 0 },
    { data: [row, row], count: 2 }, { data: [{ ...row, id: id(2) }, row], count: 2 },
    { data: [{ ...row, status: 'customer private text' }], count: 1 },
    { data: [{ ...row, created_at: 'private text' }], count: 1 },
  ]) {
    database({}, undefined, result);
    const response = await GET(request());
    expect(response.status, JSON.stringify(result)).toBe(503);
    expect(await response.json()).toEqual({ error: 'Monitor unavailable' });
  }
  database({}, undefined, { data: [row], count: 1 });
  expect((await GET(request(`source=package_requests&after=${id(2)}`))).status).toBe(503);
});

test('database-side record caps continue explicitly instead of silently declaring complete', async () => {
  const { GET } = await import('../src/app/api/monitor/requests/route.ts');
  const row = { id: id(1), status: 'pending', created_at: created, updated_at: created };
  database({}, undefined, { data: [row], count: 700 });
  const response = await GET(request('source=package_requests&limit=500'));
  expect(await response.json()).toEqual({ source: 'package_requests', records: [row], complete: false, next_cursor: id(1) });
});
