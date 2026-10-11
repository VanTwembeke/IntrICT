import { beforeEach, describe, expect, it, vi } from 'vitest';
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
import { GET as requestsGET } from '../src/app/api/package-requests/route';
import { GET as messagesGET } from '../src/app/api/messages/route';
function client(result, user = { id: 'test-user' }) {
  const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { role: 'admin' } }), then(resolve) { return Promise.resolve(result).then(resolve); } };
  createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) }, from: vi.fn().mockReturnValue(query) });
  return query;
}
beforeEach(() => vi.clearAllMocks());
describe('admin reads never disguise outages as empty success', () => {
  it.each([['requests', requestsGET], ['messages', messagesGET]])('%s distinguishes an auth service outage from a missing session', async (_name, GET) => {
    const from = vi.fn();
    createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { status: 503, message: 'private auth detail' } }) }, from });
    const response = await GET({ url: 'https://example.test/api/messages' });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: _name === 'requests' ? 'Aanvragen konden niet worden geladen.' : 'Gesprekken konden niet worden geladen.' });
    expect(from).not.toHaveBeenCalled();
  });
  it('does not silently downgrade to user reads when the role source fails', async () => {
    const query = client({ data: [] });
    query.single.mockResolvedValue({ data: null, error: { message: 'private role error' } });
    const response = await requestsGET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Aanvragen konden niet worden geladen.' });
    expect(query.order).not.toHaveBeenCalled();
  });
  it.each([400, 401, 403])('preserves 401 for rejected or missing sessions (auth status %s)', async (status) => {
    for (const GET of [requestsGET, messagesGET]) {
      const from = vi.fn();
      createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { status } }) }, from });
      expect((await GET({ url: 'https://example.test/api/messages' })).status).toBe(401);
      expect(from).not.toHaveBeenCalled();
    }
  });
  it.each([['requests', requestsGET], ['messages', messagesGET]])('%s fails closed when authentication reports a rejected identity', async (_name, GET) => {
    const from = vi.fn();
    createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'untrusted' } }, error: { status: 401 } }) }, from });
    expect((await GET({ url: 'https://example.test/api/messages' })).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });
  it.each(['admin', 'user'])('preserves read-only request visibility for %s', async (role) => {
    const query = client({ data: [] });
    query.single.mockResolvedValue({ data: { role }, error: null });
    const response = await requestsGET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(query.eq).toHaveBeenCalledWith('id', 'test-user');
    if (role === 'user') expect(query.eq).toHaveBeenCalledWith('user_id', 'test-user');
    else expect(query.eq).not.toHaveBeenCalledWith('user_id', 'test-user');
  });
  it('package requests returns 500 with a safe error when its query fails', async () => {
    client({ data: null, error: { message: 'private database detail' } });
    const response = await requestsGET();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Aanvragen konden niet worden geladen.' });
  });
  it('messages rejects unauthenticated reads rather than returning an empty inbox', async () => {
    client({ data: [] }, null);
    expect((await messagesGET({ url: 'https://example.test/api/messages' })).status).toBe(401);
  });
  it('messages returns a safe 500 for query and unexpected failures', async () => {
    client({ data: null, error: { message: 'private detail' } });
    const response = await messagesGET({ url: 'https://example.test/api/messages' });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Gesprekken konden niet worden geladen.' });
    createClient.mockRejectedValueOnce(new Error('secret'));
    expect((await messagesGET({ url: 'https://example.test/api/messages' })).status).toBe(500);
  });
  it.each(['limit=0', 'offset=-1', 'limit=nope', 'limit=2x', 'offset=1.5'])('rejects invalid pagination: %s', async (params) => {
    client({ data: [] });
    expect((await messagesGET({ url: `https://example.test/api/messages?${params}` })).status).toBe(400);
  });
  it('preserves the conversations envelope and limit/offset contract', async () => {
    const query = client({ data: [{ id: 'conversation', messages: [{ content: 'old', created_at: '2026-01-01', sender_id: 'other', read_at: null, profiles: { full_name: 'Test' } }, { content: 'latest', created_at: '2026-01-02', sender_id: 'test-user', read_at: null, profiles: null }] }], error: null });
    const response = await messagesGET({ url: 'https://example.test/api/messages?limit=200&offset=3' });
    expect(response.status).toBe(200);
    expect(query.range).toHaveBeenCalledWith(3, 102);
    expect((await response.json()).conversations[0]).toMatchObject({ id: 'conversation', unread_count: 1, last_message: { content: 'latest' } });
  });
});
