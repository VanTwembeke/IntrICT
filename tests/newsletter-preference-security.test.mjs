import { beforeEach, expect, test, vi } from 'vitest';
const { createClient, createAdminClient, sendMail } = vi.hoisted(() => ({ createClient: vi.fn(), createAdminClient: vi.fn(), sendMail: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient }));
vi.mock('@/lib/mailer', () => ({ sendMail }));
import { updateNewsletterSubscription } from '../src/app/actions/newsletter';
let auth, upsert;
beforeEach(() => {
 vi.clearAllMocks();
 auth = { data: { user: { id: 'member', email: 'owner@example.test', email_confirmed_at: '2026-01-01T00:00:00Z' } }, error: null };
 createClient.mockResolvedValue({ auth: { getUser: vi.fn(async () => auth) } });
 upsert = vi.fn().mockResolvedValue({ error: null });
 createAdminClient.mockReturnValue({ from: vi.fn(() => ({ upsert })) });
});
test.each([null, { id: 'member', email: 'owner@example.test' }, { id: 'member', email_confirmed_at: 'date' }])('unverified identity %j cannot mutate newsletter preferences', async user => {
 auth.data.user = user;
 expect((await updateNewsletterSubscription('owner@example.test', true)).success).toBe(false);
 expect(createAdminClient).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
});
test('auth error fails closed even with valid identity', async () => {
 auth.error = { message: 'private detail' };
 expect((await updateNewsletterSubscription('owner@example.test', true)).success).toBe(false);
 expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([true, false])('cannot toggle another address, subscribe=%s', async subscribe => {
 expect((await updateNewsletterSubscription('other@example.test', subscribe)).success).toBe(false);
 expect(createAdminClient).not.toHaveBeenCalled();
});
test.each([true, false])('verified own address saves preference without sending, subscribe=%s', async subscribe => {
 expect(await updateNewsletterSubscription(' OWNER@example.test ', subscribe)).toEqual({ success: true });
 expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ email: 'owner@example.test', is_active: subscribe }), { onConflict: 'email' });
 expect(sendMail).not.toHaveBeenCalled();
});
test.each([[null, true], ['owner@example.test', 'false'], ['owner@example.test', null], [12, false]])('invalid runtime arguments fail closed %j', async (email, subscribe) => {
 expect((await updateNewsletterSubscription(email, subscribe)).success).toBe(false);
 expect(createAdminClient).not.toHaveBeenCalled();
});
test('provider failure stays generic', async () => {
 upsert.mockResolvedValue({ error: { message: 'private detail' } });
 const result = await updateNewsletterSubscription('owner@example.test', true);
 expect(result.success).toBe(false); expect(result.error).not.toContain('private detail');
});
test('thrown identity failure never reaches privileged client', async () => {
 createClient.mockRejectedValue(new Error('private detail'));
 const result = await updateNewsletterSubscription('owner@example.test', false);
 expect(result.success).toBe(false); expect(result.error).not.toContain('private detail'); expect(createAdminClient).not.toHaveBeenCalled();
});
