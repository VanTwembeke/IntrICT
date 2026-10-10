import { afterEach, expect, test, vi } from 'vitest';

// Next.js supplies this boundary at build/runtime; the test runner is not an RSC environment.
vi.mock('server-only', () => ({}));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

test('mailer can be imported during build without Resend credentials', async () => {
  vi.stubEnv('RESEND_API_KEY', undefined);
  await expect(import('../src/lib/mailer')).resolves.toHaveProperty('sendMail');
});

test('sending without credentials still fails rather than silently dropping mail', async () => {
  vi.stubEnv('RESEND_API_KEY', undefined);
  const { sendMail } = await import('../src/lib/mailer');
  await expect(sendMail({ to: 'recipient@example.com', subject: 'Test', html: '<p>Test</p>' }))
    .rejects.toThrow('Missing API key');
});
