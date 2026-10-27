import { beforeEach, expect, test, vi } from 'vitest';
const { createClient, createAdminClient } = vi.hoisted(() => ({ createClient: vi.fn(), createAdminClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient }));
import { GET, DELETE } from '../src/app/api/admin/newsletter/subscribers/route';
const id = '8c4a9ef0-7882-4dcf-b6e9-59de098f228a';
let query, auth, role;
beforeEach(() => {
 vi.clearAllMocks();
 auth = { data: { user: { id: 'admin' } }, error: null }; role = { data: { role: 'admin' }, error: null };
 const identity = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(async () => role) };
 createClient.mockResolvedValue({ auth: { getUser: vi.fn(async () => auth) }, from: vi.fn(() => identity) });
 query = { select: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [], error: null }), delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id }, error: null }), then(resolve) { return Promise.resolve({ data: null, error: null }).then(resolve); } };
 createAdminClient.mockReturnValue({ from: vi.fn(() => query) });
});
const request = (body) => new Request('https://example.test/api/admin/newsletter/subscribers', { method: 'DELETE', headers: { origin: 'https://example.test', 'content-type': 'application/json' }, body: JSON.stringify(body) });
test.each(['auth', 'role'])('%s error fails closed even alongside apparently valid admin data', async (kind) => {
 (kind === 'auth' ? auth : role).error = { status: 503, message: 'private detail' };
 expect((await GET()).status).toBe(500); expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([null, {}, { id: {} }, { id: 4 }, { id: ' ' }, { id: 'a'.repeat(257) }])('invalid delete body %j cannot reach privileged data', async (body) => {
 expect((await DELETE(request(body))).status).toBe(400); expect(createAdminClient).not.toHaveBeenCalled();
});
test('malformed JSON returns 400 instead of throwing', async () => {
 expect((await DELETE(new Request('https://example.test', { method: 'DELETE', headers: { origin: 'https://example.test', 'content-type': 'application/json' }, body: '{' }))).status).toBe(400);
});
test('missing delete target is not confirmed as removed', async () => {
 query.maybeSingle.mockResolvedValue({ data: null, error: null });
 expect((await DELETE(request({ id }))).status).toBe(404);
});
test('only an exact deleted row confirms success', async () => {
 const response = await DELETE(request({ id })); expect(response.status).toBe(200); expect(await response.json()).toEqual({ ok: true });
 expect(query.eq).toHaveBeenCalledWith('id', id); expect(query.select).toHaveBeenCalledWith('id');
});
test('source error is generic and private reads are never cached', async () => {
 query.order.mockResolvedValue({ data: null, error: { message: 'private database detail' } });
 const response = await GET(); expect(response.status).toBe(500); expect(JSON.stringify(await response.json())).not.toContain('private database detail');
 expect(response.headers.get('cache-control')).toContain('no-store');
});

test.each([undefined, 'null', 'https://evil.test', 'https://example.test.evil.test'])('untrusted origin %s never reaches identity or privileged datastore', async (origin) => {
 const headers = { 'content-type': 'application/json' };
 if (origin !== undefined) headers.origin = origin;
 const response = await DELETE(new Request('https://example.test/api/admin/newsletter/subscribers', { method: 'DELETE', headers, body: JSON.stringify({ id }) }));
 expect(response.status).toBe(403); expect(createClient).not.toHaveBeenCalled(); expect(createAdminClient).not.toHaveBeenCalled();
});
test('contradictory cross-site fetch metadata is denied', async () => {
 const req = request({ id }); req.headers.set('sec-fetch-site', 'cross-site');
 expect((await DELETE(req)).status).toBe(403); expect(createAdminClient).not.toHaveBeenCalled();
});
test.each(['not-a-uuid', id + ' ', id.replace(/-/g, ''), "id.eq.anything", '00000000-0000-0000-0000-000000000000'])('invalid identity %s never reaches privileged deletion', async (invalid) => {
 expect((await DELETE(request({ id: invalid }))).status).toBe(400); expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([401,403,500])('auth failure %s cannot delete even with an apparent identity', async (status) => {
 auth.error = { status }; expect((await DELETE(request({ id }))).status).toBe(status === 500 ? 500 : 401); expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([null, { id: 'member' }])('missing or non-admin identity cannot delete: %j', async (user) => {
 auth.data.user = user; role.data.role = 'client';
 expect((await DELETE(request({ id }))).status).toBe(user ? 403 : 401); expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([{ data: { id: 'other' }, error: null }, { data: { id }, error: { message: 'secret' } }])('inconsistent deletion result never confirms success', async (result) => {
 query.maybeSingle.mockResolvedValue(result); const response = await DELETE(request({ id }));
 expect(response.status).toBe(500); expect(await response.json()).not.toEqual({ ok: true });
});

test('uppercase UUID identifies the same database row without false failure', async () => {
 const response = await DELETE(request({ id: id.toUpperCase() }));
 expect(response.status).toBe(200); expect(query.eq).toHaveBeenCalledWith('id', id);
});
test('GET returns only the selected subscriber fields in newest-first order', async () => {
 const rows = [{ id, email: 'fixture@example.test', is_active: true, subscribed_at: '2026-01-01T00:00:00Z', unsubscribed_at: null }];
 query.order.mockResolvedValue({ data: rows, error: null });
 const response = await GET(); expect(await response.json()).toEqual(rows);
 expect(query.select).toHaveBeenCalledWith('id, email, is_active, subscribed_at, unsubscribed_at');
 expect(query.order).toHaveBeenCalledWith('subscribed_at', { ascending: false });
 expect(response.headers.get('cache-control')).toBe('private, no-store');
});
test.each(['GET', 'DELETE'])('thrown provider errors on %s are generic and never success', async (method) => {
 createClient.mockRejectedValue(new Error('private provider detail'));
 const response = method === 'GET' ? await GET() : await DELETE(request({ id }));
 expect(response.status).toBe(500); expect(JSON.stringify(await response.json())).not.toContain('private provider detail');
 expect(createAdminClient).not.toHaveBeenCalled();
});
