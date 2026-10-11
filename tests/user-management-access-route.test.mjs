import { expect, test, vi } from 'vitest';
const actor = '11111111-1111-4111-8111-111111111111';
const target = '22222222-2222-4222-8222-222222222222';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), session: vi.fn() }));
vi.mock('../src/lib/supabase/server', () => ({ createClient: mocks.session }));
vi.mock('../src/lib/supabase/admin', () => ({ createAdminClient: mocks.admin }));
test('route rejects cross-origin and non-admin before service-role client creation', async () => {
  const { POST } = await import('../src/app/api/admin/users/[id]/access/route.ts');
  mocks.admin.mockClear(); mocks.session.mockClear();
  const url = `https://www.intrict.com/api/admin/users/${target}/access`;
  const make = origin => new Request(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ confirmationId: target }) });
  const context = { params: Promise.resolve({ id: target }) };
  expect((await POST(make('https://evil.test'), context)).status).toBe(403);
  expect(mocks.session).not.toHaveBeenCalled();
  expect(mocks.admin).not.toHaveBeenCalled();
  mocks.session.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: actor } }, error: null }) }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'user' }, error: null }) }) }) }) });
  expect((await POST(make('https://www.intrict.com'), context)).status).toBe(403);
  expect(mocks.admin).not.toHaveBeenCalled();
});

test('access route uses supported updateUserById and exact-target readback without metadata or record writes', async () => {
  const path = '../src/app/api/admin/users/[id]/access/route.ts';
  const fs = await import('node:fs');
  expect(fs.existsSync(new URL(path, import.meta.url)), 'access route must exist').toBe(true);
  const { POST, GET } = await import(path);
  const updateUserById = vi.fn().mockResolvedValue({ data: { user: { id: target } }, error: null });
  const getUserById = vi.fn().mockResolvedValue({ data: { user: { id: target, banned_until: '2126-01-01T00:00:00Z', app_metadata: { custom: 'preserved' } } }, error: null });
  const select = vi.fn(() => ({ eq: vi.fn((field, id) => { expect(field).toBe('id'); expect(id).toBe(target); return { maybeSingle: async () => ({ data: { id: target, role: 'user' }, error: null }) }; }) }));
  mocks.admin.mockReturnValue({ auth: { admin: { updateUserById, getUserById } }, from: vi.fn(() => ({ select })) });
  mocks.session.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: actor } }, error: null }) }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'admin' }, error: null }) }) }) }) });
  const url = `https://www.intrict.com/api/admin/users/${target}/access`;
  const response = await POST(new Request(url, { method: 'POST', headers: { origin: 'https://www.intrict.com', 'content-type': 'application/json' }, body: JSON.stringify({ confirmationId: target }) }), { params: Promise.resolve({ id: target }) });
  expect(response.status).toBe(200);
  expect(updateUserById).toHaveBeenCalledExactlyOnceWith(target, { ban_duration: '876000h' });
  expect(getUserById.mock.calls).toEqual([[target], [target]]);
  const status = await GET(new Request(url, { headers: { 'sec-fetch-site': 'same-origin' } }), { params: Promise.resolve({ id: target }) });
  expect((await status.json()).status).toBe('disabled_not_deleted');
  expect(updateUserById).toHaveBeenCalledTimes(1);
});
