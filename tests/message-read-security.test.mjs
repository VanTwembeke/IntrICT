import { beforeEach, expect, test, vi } from 'vitest';
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
import { POST } from '../src/app/api/messages/conversation/mark-read/route';
import { GET } from '../src/app/api/messages/conversation/[conversationId]/route';
let auth, participant, rpc, queries;
const id = '8c4a9ef0-7882-4dcf-b6e9-59de098f228a';
beforeEach(() => {
 vi.clearAllMocks();
 auth = { data: { user: { id: 'member' } }, error: null };
 participant = { data: { profile_id: 'member' }, error: null };
 rpc = vi.fn().mockResolvedValue({ data: null, error: null });
 const chain = result => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(async () => result()), maybeSingle: vi.fn(async () => result()), order: vi.fn(async () => result()) });
 queries = { conversation_participants: chain(() => participant), conversations: chain(() => ({ data: { id }, error: null })), messages: chain(() => ({ data: [], error: null })) };
 createClient.mockResolvedValue({ auth: { getUser: vi.fn(async () => auth) }, rpc, from: vi.fn(table => queries[table]) });
});
const post = body => POST(new Request('https://example.test/api/messages/conversation/mark-read', { method: 'POST', body: JSON.stringify(body) }));
const get = () => GET(new Request('https://example.test'), { params: Promise.resolve({ conversationId: id }) });
for (const [name, call] of [['POST', () => post({ conversationId: id })], ['GET', get]]) {
 test(`${name} never confirms success after RPC rejection`, async () => {
  rpc.mockResolvedValue({ error: { code: '42501', message: 'private detail' } });
  const response = await call(); expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: 'Service unavailable' });
 });
 test(`${name} missing identity is unauthorized`, async () => {
  auth.data.user = null; expect((await call()).status).toBe(401); expect(rpc).not.toHaveBeenCalled();
 });
 test(`${name} auth rejection with apparent identity fails closed`, async () => {
  auth.error = { message: 'private detail' }; expect((await call()).status).toBe(401); expect(rpc).not.toHaveBeenCalled();
 });
 test(`${name} nonparticipant cannot invoke RPC or discover conversation`, async () => {
  participant.data = null; const response = await call(); expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: 'Conversation not found' }); expect(rpc).not.toHaveBeenCalled();
 });
 test(`${name} membership provider outage is not absence`, async () => {
  participant.error = { code: 'XX000', message: 'private detail' }; const response = await call();
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: 'Service unavailable' }); expect(rpc).not.toHaveBeenCalled();
 });
 test(`${name} thrown RPC failure stays generic`, async () => {
  rpc.mockRejectedValue(new Error('private detail')); const response = await call();
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: 'Service unavailable' });
 });
 test(`${name} participant success binds current actor`, async () => {
  expect((await call()).status).toBe(200);
  expect(rpc).toHaveBeenCalledWith('mark_messages_read', { conversation_uuid: id, user_uuid: 'member' });
  expect(queries.conversation_participants.eq).toHaveBeenCalledWith('profile_id', 'member');
 });
}
test.each([null, {}, { conversationId: 3 }, { conversationId: 'not-a-uuid' }, { conversationId: id + ' ' }])('invalid mark-read payload %j is rejected', async body => {
 expect((await post(body)).status).toBe(400); expect(rpc).not.toHaveBeenCalled();
});
test('malformed mark-read JSON is rejected', async () => {
 expect((await POST(new Request('https://example.test', { method: 'POST', body: '{' }))).status).toBe(400); expect(rpc).not.toHaveBeenCalled();
});
