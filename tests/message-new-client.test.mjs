import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import MessagesPage from '../src/app/dashboard/messages/MessagesPage';

// Only animation is removed; exercise the real mounted page and its fetch boundary.
vi.mock('framer-motion', () => {
  const components = {};
  return { motion: new Proxy({}, { get: (_, tag) => {
    components[tag] ??= ({ children, ...props }) => React.createElement(tag,
      Object.fromEntries(Object.entries(props).filter(([key]) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'].includes(key))), children);
    return components[tag];
  } }) };
});
const actor = '00000000-0000-0000-0000-000000000001';
const recipient = '00000000-0000-0000-0000-000000000002';
const conversation = '00000000-0000-0000-0000-000000000003';
const messageId = '00000000-0000-0000-0000-000000000004';
const raw = '  Eerste bericht\n ';
const success = () => ({ conversationId: conversation, message: { id: messageId, conversation_id: conversation, sender_id: actor, content: raw } });
const reply = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
let posts;
function setup(outcome) {
  posts = [];
  vi.stubGlobal('React', React);
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    if (options?.method === 'POST') { posts.push([url, options]); return outcome(url, options); }
    if (url === '/api/messages') return reply({ conversations: [] });
    return reply({ conversation: { id: conversation, subject: '', conversation_participants: [] }, messages: [] });
  }));
  render(React.createElement(MessagesPage, { profile: { id: actor, role: 'admin', email: 'actor@example.test' }, allProfiles: [{ id: recipient, role: 'user', email: 'recipient@example.test' }], initialConversations: [{ id: conversation, subject: 'Bestaand', unread_count: 0, last_message: null }] }));
  fireEvent.click(screen.getByTitle('Nieuw gesprek'));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: recipient } });
  fireEvent.change(screen.getByPlaceholderText('Typ je eerste bericht...'), { target: { value: raw } });
}
const start = () => screen.getByRole('button', { name: 'Start Gesprek' });
async function submit() { await act(async () => fireEvent.click(start())); }
function expectPreserved() { expect(screen.getByPlaceholderText('Typ je eerste bericht...').value).toBe(raw); expect(screen.getByRole('combobox').value).toBe(recipient); }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('synchronous same-render reentry issues only one creation and pending cancel preserves draft', async () => {
  let resolve;
  setup(() => new Promise(r => { resolve = r; }));
  const button = start();
  const props = button[Object.keys(button).find(k => k.startsWith('__reactProps$'))];
  act(() => { props.onClick(); props.onClick(); });
  expect(posts).toHaveLength(1);
  expect(start().disabled).toBe(true);
  fireEvent.click(screen.getByText('Annuleren', { selector: 'button' }));
  if (!screen.queryByPlaceholderText('Typ je eerste bericht...')) fireEvent.click(screen.getByTitle('Nieuw gesprek'));
  expectPreserved();
  await act(async () => resolve(reply(success())));
  expect(screen.queryByPlaceholderText('Typ je eerste bericht...')).toBeNull();
});

const malformed = [
  ['error-bearing', () => ({ ...success(), error: null })],
  ['array body', () => Object.assign([], success())],
  ['missing IDs', () => ({ message: {} })],
  ['invalid UUID', () => ({ ...success(), conversationId: 'not-a-uuid' })],
  ['array message', () => ({ ...success(), message: Object.assign([], success().message) })],
  ['wrong conversation', () => ({ ...success(), message: { ...success().message, conversation_id: recipient } })],
  ['wrong actor', () => ({ ...success(), message: { ...success().message, sender_id: recipient } })],
  ['missing actor', () => ({ ...success(), message: { ...success().message, sender_id: undefined } })],
  ['trimmed text', () => ({ ...success(), message: { ...success().message, content: raw.trim() } })],
  ['created false', () => ({ ...success(), created: false })],
  ['conflicting outcome', () => ({ ...success(), outcome: 'unknown' })],
];
for (const [name, body] of malformed) test(`unconfirmed ${name} preserves draft and blocks replay across panel toggle`, async () => {
  setup(() => reply(body()));
  await submit();
  expectPreserved();
  expect(screen.getByRole('status').textContent).toContain('niet worden bevestigd');
  expect(start().disabled).toBe(true);
  fireEvent.click(screen.getByTitle('Annuleren'));
  fireEvent.click(screen.getByTitle('Nieuw gesprek'));
  await submit();
  expectPreserved();
  expect(posts).toHaveLength(1);
});
for (const [name, outcome] of [
  ['503', () => reply({}, 503)],
  ['non JSON', () => ({ ok: true, status: 200, json: async () => { throw Error('invalid JSON'); } })],
  ['transport', () => { throw Error('lost response'); }],
]) test(`unknown ${name} never replays and retains draft`, async () => {
  setup(outcome); await submit(); expectPreserved(); expect(start().disabled).toBe(true); await submit(); expect(posts).toHaveLength(1);
});
for (const status of [400, 401, 403]) test(`known ${status} permits only explicit retry`, async () => {
  setup(() => posts.length === 1 ? reply({ error: 'denied' }, status) : reply(success()));
  await submit(); expectPreserved(); expect(start().disabled).toBe(false); expect(posts).toHaveLength(1);
  await submit(); expect(posts).toHaveLength(2); expect(screen.queryByPlaceholderText('Typ je eerste bericht...')).toBeNull();
});
test('confirmed raw text with optional empty subject clears form exactly once', async () => {
  setup(() => reply({ ...success(), created: true, outcome: 'created' })); await submit();
  expect(posts).toHaveLength(1); expect(JSON.parse(posts[0][1].body)).toEqual({ recipientId: recipient, subject: '', message: raw });
  expect(screen.queryByPlaceholderText('Typ je eerste bericht...')).toBeNull();
});
test('existing attachment followup is unchanged after confirmed initial message', async () => {
  setup(url => url === '/api/messages/new' ? reply(success()) : reply({ error: 'existing rejection' }, 503));
  const file = new File(['bytes'], 'fixture.txt', { type: 'text/plain' });
  fireEvent.change(document.getElementById('new-conv-file-upload'), { target: { files: [file] } });
  await submit();
  expect(posts.map(p => p[0])).toEqual(['/api/messages/new', '/api/messages/send']);
  expect(posts[1][1].body.get('files')).toBe(file);
  expect(posts[1][1].body.get('conversation_id')).toBe(conversation);
  expect(posts[1][1].body.get('content')).toBe('📎 Bijlage(n)');
  // Existing non-ok followup handling is deliberately NOT repaired by this scoped patch.
  expect(screen.queryByPlaceholderText('Typ je eerste bericht...')).toBeNull();
});
test('unconfirmed initial response never sends attachment followup and keeps file', async () => {
  setup(() => reply({ ...success(), error: 'contradiction' }));
  fireEvent.change(document.getElementById('new-conv-file-upload'), { target: { files: [new File(['x'], 'retained.txt')] } });
  await submit(); expect(posts).toHaveLength(1); expectPreserved(); expect(screen.getByText('retained.txt')).toBeTruthy();
});
