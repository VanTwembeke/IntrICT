import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    'server-only': fileURLToPath(new URL('./node_modules/next/dist/compiled/server-only/index.js', import.meta.url)),
  } },
  // DOM interaction tests share limited CI CPU; bound contention, not assertions or deadlines.
  test: { maxWorkers: 2, environment: 'jsdom', include: ['tests/**/*.test.mjs'] },
});
