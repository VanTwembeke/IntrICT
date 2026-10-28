import { beforeEach, expect, test, vi } from 'vitest';
const { createClient, sendMail } = vi.hoisted(() => ({ createClient: vi.fn(), sendMail: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/mailer', () => ({ sendMail }));
import { PUT } from '../src/app/api/appointments/[id]/route';
let auth, profile, existing, saved, query;
beforeEach(() => {
 vi.clearAllMocks();
 auth = { data: { user: { id: 'member' } }, error: null };
 profile = { data: { role: 'user' }, error: null };
 existing = { data: { user_id: 'member', status: 'pending', duration_minutes: 30 }, error: null };
 saved = { data: { id: 'appointment', status: 'cancelled' }, error: null };
 query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), single: vi.fn(async () => query.update.mock.calls.length ? saved : existing) };
 const identity = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(async () => profile) };
 createClient.mockResolvedValue({ auth: { getUser: vi.fn(async () => auth) }, from: vi.fn(table => table === 'profiles' ? identity : query) });
});
const params = { params: Promise.resolve({ id: 'appointment' }) };
const request = body => new Request('https://example.test/api/appointments/appointment', { method: 'PUT', body: JSON.stringify(body) });
test.each(['admin_notes', 'meeting_link', 'location', 'starts_at', 'ends_at', 'notes', 'user_id', 'updated_at'])('non-admin cannot smuggle %s through cancellation', async field => {
 expect((await PUT(request({ status: 'cancelled', [field]: 'injected' }), params)).status).toBe(403);
 expect(query.update).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
});
test('own pending cancellation writes only allowed fields', async () => {
 expect((await PUT(request({ status: 'cancelled', cancellation_reason: 'No longer needed' }), params)).status).toBe(200);
 expect(query.update).toHaveBeenCalledWith({ status: 'cancelled', cancellation_reason: 'No longer needed' });
 expect(query.eq).toHaveBeenCalledWith('user_id', 'member'); expect(query.eq).toHaveBeenCalledWith('status', 'pending');
 expect(sendMail).not.toHaveBeenCalled();
});
test.each([{ user_id: 'other', status: 'pending' }, { user_id: 'member', status: 'confirmed' }, null])('cannot cancel unavailable or ineligible appointment %j', async row => {
 existing.data = row; expect((await PUT(request({ status: 'cancelled' }), params)).status).toBe(403); expect(query.update).not.toHaveBeenCalled();
});
test.each([null, [], { status: 'cancelled', cancellation_reason: {} }, { status: 'cancelled', cancellation_reason: 'x'.repeat(2001) }])('invalid body %j is rejected before writes', async body => {
 expect((await PUT(request(body), params)).status).toBe(400); expect(query.update).not.toHaveBeenCalled();
});
test('malformed JSON is a generic 400', async () => {
 const response = await PUT(new Request('https://example.test', { method: 'PUT', body: '{' }), params);
 expect(response.status).toBe(400); expect(query.update).not.toHaveBeenCalled();
});
test('auth error cannot cancel using apparent user data', async () => {
 auth.error = { message: 'private detail' }; expect((await PUT(request({ status: 'cancelled' }), params)).status).toBe(401); expect(query.update).not.toHaveBeenCalled();
});
test('role query error cannot activate admin flow', async () => {
 profile = { data: { role: 'admin' }, error: { message: 'private detail' } };
 expect((await PUT(request({ status: 'cancelled', admin_notes: 'injected' }), params)).status).toBe(503); expect(query.update).not.toHaveBeenCalled();
});
test('database rejection is not success or private detail', async () => {
 saved.error = { message: 'private detail' }; const response = await PUT(request({ status: 'cancelled' }), params);
 expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain('private detail');
});
test('admin retains fields and duration recomputation', async () => {
 profile.data.role = 'admin';
 const body = { status: 'confirmed', admin_notes: 'fixture', meeting_link: 'https://example.test/meeting', location: 'fixture', starts_at: '2026-11-01T10:00:00Z', notes: 'fixture' };
 expect((await PUT(request(body), params)).status).toBe(200);
 expect(query.update).toHaveBeenCalledWith({ ...body, ends_at: '2026-11-01T10:30:00.000Z', updated_at: expect.any(String) });
});
