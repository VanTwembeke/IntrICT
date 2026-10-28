import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ESLint } from 'eslint';
import Header from '../src/components/common/Header';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/' }));
vi.mock('../src/hooks/useMessages', () => ({ useMessages: () => ({ conversations: [], unreadCount: 0, loading: false, markAsRead: vi.fn() }) }));
vi.mock('../src/lib/supabase/client', () => ({ createClient: () => ({ auth: { getSession: () => new Promise(() => {}), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } }) }));
afterEach(cleanup);
test('search query resets keyboard selection before Enter and exposes no dashboard results to guests', async () => {
  const view = render(React.createElement(Header));
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  const input = view.container.querySelector('input');
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  fireEvent.change(input, { target: { value: 'contact' } });
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(push).toHaveBeenLastCalledWith('/contact');
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  fireEvent.change(view.container.querySelector('input'), { target: { value: 'Dashboard' } });
  expect(view.container.querySelector('a[href="/dashboard"]')).toBeNull();
});

// ESLint cold startup is independent from the UI interaction deadline.
test('header search remains free of ESLint errors', async () => {
  const results = await new ESLint().lintFiles(['src/components/common/Header.tsx']);
  expect(results.flatMap(r => r.messages.filter(m => m.severity === 2))).toEqual([]);
}, 15000);
