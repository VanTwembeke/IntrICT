import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MessagesPage from '../src/app/dashboard/messages/MessagesPage';
import AanvragenPage from '../src/app/dashboard/aanvragen/page';

const { createClient, redirect } = vi.hoisted(() => ({ createClient: vi.fn(), redirect: vi.fn((path) => { throw new Error(`redirect:${path}`); }) }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('framer-motion', () => {
  const element = (tag) => function MotionTestElement({ children, initial, animate, exit, transition, layout, whileHover, whileTap, ...props }) {
    void initial; void animate; void exit; void transition; void layout; void whileHover; void whileTap;
    return React.createElement(tag, props, children);
  };
  return { AnimatePresence: ({ children }) => children, motion: { div: element('div'), button: element('button') } };
});
beforeEach(() => vi.clearAllMocks());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const profile = { id: 'admin', role: 'admin', full_name: 'Admin', email: 'admin@example.test' };
const conversation = { id: 'conversation', subject: 'Bestaand gesprek', created_at: '2026-01-01', updated_at: '2026-01-01', created_by: 'admin', last_message: null, unread_count: 0 };

test('failed inbox refresh retains previous conversations and retry replaces them only on success', async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ conversation: { ...conversation, conversation_participants: [] }, messages: [] }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'private source failure' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ conversations: [] }) });
  vi.stubGlobal('fetch', fetch);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(React.createElement(MessagesPage, { profile, allProfiles: [], initialConversations: [conversation] }));
  fireEvent.click(screen.getByRole('button', { name: /Bestaand gesprek/ }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Gesprekken konden niet worden geladen.'));
  expect(screen.getByRole('button', { name: /Bestaand gesprek/ })).toBeTruthy();
  expect(screen.queryByText('Geen gesprekken gevonden')).toBeNull();
  expect(screen.queryByText(/private source failure/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Opnieuw proberen' }));
  await waitFor(() => expect(screen.getByText('Geen gesprekken gevonden')).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
  expect(fetch).toHaveBeenLastCalledWith('/api/messages');
});

test.each([
  ['HTTP failure', () => Promise.resolve({ ok: false, json: async () => ({ error: 'private error' }) })],
  ['network failure', () => Promise.reject(new Error('network failure'))],
  ['invalid JSON', () => Promise.resolve({ ok: true, json: async () => { throw new SyntaxError('invalid JSON'); } })],
  ['missing conversations', () => Promise.resolve({ ok: true, json: async () => ({}) })],
  ['null body', () => Promise.resolve({ ok: true, json: async () => null })],
])('initial inbox %s settles loading without an empty state and can recover', async (_name, failure) => {
  let resolveRetry;
  const fetch = vi.fn().mockImplementationOnce(failure).mockImplementationOnce(() => new Promise((resolve) => { resolveRetry = resolve; }));
  vi.stubGlobal('fetch', fetch);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(React.createElement(MessagesPage, { profile, allProfiles: [] }));
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(screen.queryByText('Berichten Laden...')).toBeNull();
  expect(screen.queryByText('Geen gesprekken gevonden')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Opnieuw proberen' }));
  expect(screen.getByRole('button', { name: 'Opnieuw laden...' }).disabled).toBe(true);
  resolveRetry({ ok: true, json: async () => ({ conversations: [conversation] }) });
  await waitFor(() => expect(screen.getByRole('button', { name: /Bestaand gesprek/ })).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
});

test('successful empty inbox shows the empty state without a load error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ conversations: [] }) }));
  render(React.createElement(MessagesPage, { profile, allProfiles: [] }));
  await waitFor(() => expect(screen.getByText('Geen gesprekken gevonden')).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
});

function requestsSource(result, { user = { id: 'admin' }, role = 'admin', reject = false } = {}) {
  const query = { select: vi.fn().mockReturnThis(), order: vi.fn(() => reject ? Promise.reject(new Error('private database detail')) : Promise.resolve(result)) };
  const roleQuery = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { role } }) };
  const from = vi.fn((table) => table === 'profiles' ? roleQuery : query);
  createClient.mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) }, from });
  return { query, from, roleQuery };
}

test.each(['returned error', 'thrown error', 'missing data'])('requests page renders a distinct safe source error for %s', async (kind) => {
  requestsSource({ data: null, error: kind === 'missing data' ? null : { message: 'private database detail' } }, { reject: kind === 'thrown error' });
  render(await AanvragenPage());
  expect(screen.getByRole('alert').textContent).toContain('Aanvragen konden niet worden geladen.');
  expect(screen.queryByText('Nog geen aanvragen.')).toBeNull();
  expect(screen.queryByText(/0 nieuw/)).toBeNull();
  expect(screen.queryByText(/private database detail/)).toBeNull();
  expect(screen.getByRole('link', { name: 'Opnieuw proberen' }).getAttribute('href')).toBe('/dashboard/aanvragen');
});

test('requests page shows empty only after a successful empty query', async () => {
  requestsSource({ data: [], error: null });
  render(await AanvragenPage());
  expect(screen.getByText('Nog geen aanvragen.')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('successful server reads preserve joined customer data, priority ordering, and search', async () => {
  const request = (id, date) => ({ id, user_id: id, status: 'pending', created_at: date, package_name: 'Pakket', package_price: 100, profile: { full_name: id, email: `${id}@example.test`, company: `Bedrijf ${id}`, phone: '12345' } });
  const { query, roleQuery } = requestsSource({ data: [request('newer', '2026-01-02'), request('oldest', '2026-01-01')], error: null });
  render(await AanvragenPage());
  expect(query.select).toHaveBeenCalledWith('*, profile:profiles(full_name, email, company, phone)');
  expect(query.order).toHaveBeenCalledWith('created_at', { ascending: false });
  expect(roleQuery.eq).toHaveBeenCalledWith('id', 'admin');
  expect(screen.getAllByRole('button', { expanded: false })[0].textContent).toContain('oldest');
  fireEvent.click(screen.getByRole('button', { name: /oldest/ }));
  expect(screen.getByRole('link', { name: 'oldest@example.test' }).getAttribute('href')).toBe('mailto:oldest@example.test');
  expect(screen.getByText('Bedrijf oldest')).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Zoek aanvragen' }), { target: { value: 'newer@example.test' } });
  expect(screen.queryByText('oldest')).toBeNull();
  expect(screen.getByText('newer')).toBeTruthy();
});

test.each([
  [{ user: null }, '/login'],
  [{ role: 'user' }, '/dashboard'],
])('requests page preserves access redirects for %j', async (options, destination) => {
  const { from } = requestsSource({ data: [], error: null }, options);
  await expect(AanvragenPage()).rejects.toThrow(`redirect:${destination}`);
  expect(from).not.toHaveBeenCalledWith('package_requests');
});

