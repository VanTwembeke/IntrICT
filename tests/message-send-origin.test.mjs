// @vitest-environment node
import { beforeEach, expect, test, vi } from 'vitest';
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
import { POST } from '../src/app/api/messages/send/route';
const origin = 'https://www.intrict.com';
let bodyRead, auth, from, member, inserted;
beforeEach(() => {
  vi.clearAllMocks(); bodyRead = vi.fn();
  auth = vi.fn(async () => ({ data: { user: { id: 'actor' } }, error: null }));
  member = { data: { profile_id: 'actor' }, error: null };
  inserted = vi.fn();
  from = vi.fn(table => {
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      insert: vi.fn(value => { inserted(value); return chain; }),
      single: vi.fn(async () => table === 'conversation_participants' ? member : ({ data: { id: 'confirmed-message' }, error: null })) };
    return chain;
  });
  createClient.mockResolvedValue({ auth: { getUser: auth }, from });
});
function request(headers = { origin, 'sec-fetch-site': 'same-origin' }) {
  const req = new Request(origin + '/api/messages/send', { method: 'POST', headers });
  req.formData = async () => { bodyRead(); const f = new FormData(); f.set('conversation_id', 'conversation'); f.set('content', 'synthetic'); return f; };
  return req;
}
test.each([
  ['sibling same-site', { origin: 'https://untrusted.intrict.com', 'sec-fetch-site': 'same-site' }],
  ['cross-site', { origin: 'https://untrusted.invalid', 'sec-fetch-site': 'cross-site' }],
  ['missing Origin', { 'sec-fetch-site': 'same-origin' }],
  ['null Origin', { origin: 'null', 'sec-fetch-site': 'same-origin' }],
  ['both missing', {}],
  ['same Origin, wrong fetch-site', { origin, 'sec-fetch-site': 'same-site' }],
  ['same Origin, navigation fetch-site', { origin, 'sec-fetch-site': 'none' }],
  ['Origin trailing slash', { origin: origin + '/' }],
  ['HTTP downgrade', { origin: 'http://www.intrict.com' }],
  ['different port', { origin: origin + ':444' }],
])('%s rejected before authentication, body consumption or datastore access', async (_, headers) => {
  const r = await POST(request(headers));
  expect(r.status).toBe(403);
  expect(r.headers.get('cache-control')).toContain('no-store');
  expect(await r.json()).toEqual({ error: 'Invalid request origin' });
  expect(createClient).not.toHaveBeenCalled(); expect(auth).not.toHaveBeenCalled();
  expect(bodyRead).not.toHaveBeenCalled(); expect(from).not.toHaveBeenCalled(); expect(inserted).not.toHaveBeenCalled();
});
test.each([{ origin, 'sec-fetch-site': 'same-origin' }, { origin }])('same-origin preserves legacy successful response with headers %j', async headers => {
  const r = await POST(request(headers)); expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ message: 'Message sent successfully', messageId: 'confirmed-message' });
  expect(inserted).toHaveBeenCalledTimes(1);
  expect(inserted).toHaveBeenCalledWith({ conversation_id: 'conversation', sender_id: 'actor', content: 'synthetic', parent_message_id: null });
});
test('same-origin guest still rejected before body read', async () => {
  auth.mockResolvedValue({ data: { user: null }, error: null });
  expect((await POST(request())).status).toBe(401); expect(bodyRead).not.toHaveBeenCalled(); expect(from).not.toHaveBeenCalled();
});
test('same-origin nonparticipant remains denied without insertion', async () => {
  member.data = null; expect((await POST(request())).status).toBe(403); expect(inserted).not.toHaveBeenCalled();
});
