import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useMessages } from '../src/hooks/useMessages';
import { ChatProvider, invalidateConversationsCache, useChatContext } from '../src/contexts/ChatContext';
vi.mock('../src/lib/supabase/client', () => ({ createClient: () => ({ channel: () => ({ on() { return this; }, subscribe() { return this; } }), removeChannel() {} }) }));
afterEach(() => { cleanup(); invalidateConversationsCache(); vi.unstubAllGlobals(); });
const wrapper = ({ children }) => React.createElement(ChatProvider, null, children);
for (const [name, hook, options] of [['standalone', useMessages, {}], ['shared', useChatContext, { wrapper }]]) {
 test(`${name} rejected mark-read HTTP response reconciles unread state`, async () => {
  const fetchMock = vi.fn(async url => url === '/api/messages' ? { ok: true, json: async () => ({ conversations: [{ id: 'fixture', unread_count: 3 }] }) } : { ok: false, status: 503, json: async () => ({ error: 'Service unavailable' }) });
  vi.stubGlobal('fetch', fetchMock);
  const view = renderHook(hook, options);
  await waitFor(() => expect(view.result.current.unreadCount).toBe(3));
  await act(async () => view.result.current.markAsRead('fixture'));
  await waitFor(() => expect(view.result.current.unreadCount).toBe(3));
  expect(fetchMock.mock.calls.filter(([url]) => url === '/api/messages')).toHaveLength(2);
 });
}
