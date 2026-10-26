import { expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';

test('DOM suite bounds worker contention without relaxing timeout or isolation', () => {
  const config = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', "import config from './vitest.config.mjs'; console.log(JSON.stringify(config.test));"], { encoding: 'utf8' }));
  expect(config.maxWorkers).toBe(2);
  expect(config.testTimeout).toBeUndefined();
  expect(config.isolate).not.toBe(false);
  expect(config.include).toContain('tests/**/*.test.mjs');
});
