import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { ESLint } from 'eslint';
import { useMessages } from '../src/hooks/useMessages';
import { ChatProvider, invalidateConversationsCache, useChatContext } from '../src/contexts/ChatContext';
const { removeChannel } = vi.hoisted(() => ({ removeChannel: vi.fn() }));
vi.mock('../src/lib/supabase/client', () => ({ createClient: () => ({ channel: () => ({ on() { return this; }, subscribe() { return this; } }), removeChannel }) }));
afterEach(() => { cleanup(); invalidateConversationsCache(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
const conversations = [{ id: 'fixture', unread_count: 3 }];
const wrapper = ({ children }) => React.createElement(ChatProvider, null, children);
for (const [name, hook, options, loadingKey, file] of [
  ['standalone', useMessages, {}, 'loading', 'src/hooks/useMessages.ts'],
  ['shared chat', useChatContext, { wrapper }, 'conversationsLoading', 'src/contexts/ChatContext.tsx'],
]) {
  test(`${name} loads after real network completion, counts unread messages and cleans subscriptions`, async () => {
    let resolve;
    const fetchMock = vi.fn(() => new Promise(r => { resolve = r; }));
    vi.stubGlobal('fetch', fetchMock);
    const view = renderHook(hook, options);
    expect(view.result.current[loadingKey]).toBe(true);
    expect(view.result.current.conversations).toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/messages');
    await act(async () => resolve({ ok: true, json: async () => ({ conversations }) }));
    expect(view.result.current[loadingKey]).toBe(false);
    expect(view.result.current.unreadCount).toBe(3);
    view.unmount();
    expect(removeChannel).toHaveBeenCalledOnce();
    const results = await new ESLint().lintFiles([file]);
    expect(results.flatMap(r => r.messages.filter(m => m.severity === 2))).toEqual([]);
  });
}
test('shared chat initializes fresh cache without another request and force-refetches on demand', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversations }) }));
  const first = renderHook(useChatContext, { wrapper });
  await waitFor(() => expect(first.result.current.conversationsLoading).toBe(false));
  first.unmount();
  const second = renderHook(useChatContext, { wrapper });
  expect(second.result.current.conversations).toEqual(conversations);
  expect(second.result.current.conversationsLoading).toBe(false);
  expect(fetch).toHaveBeenCalledOnce();
  await act(async () => second.result.current.refetchConversations());
  expect(fetch).toHaveBeenCalledTimes(2);
});
