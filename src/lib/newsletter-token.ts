import { createHmac } from 'crypto';

const SECRET = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? 'fallback-dev-secret-change-in-prod';

export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', SECRET).update(email.toLowerCase().trim()).digest('hex');
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  // Timing-safe comparison
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
