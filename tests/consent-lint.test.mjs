import { ESLint } from 'eslint';
import { expect, test } from 'vitest';

for (const name of ['ConditionalAnalytics', 'CookieConsent']) {
  test(`${name} does not synchronously update state in mount effects`, async () => {
    const results = await new ESLint().lintFiles([`src/components/common/${name}.tsx`]);
    const errors = results.flatMap(result => result.messages.filter(message => message.severity === 2));
    expect(errors).toEqual([]);
  });
}
