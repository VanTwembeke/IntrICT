import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AanvragenClient from '../src/app/dashboard/aanvragen/AanvragenClient';
vi.mock('framer-motion', () => ({ AnimatePresence: ({ children }) => children, motion: { div: ({ children, layout, initial, animate, exit, transition, ...props }) => { void layout; void initial; void animate; void exit; void transition; return React.createElement('div', props, children); } } }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const request = (id, status, created_at) => ({ id, status, created_at, package_name: 'Testpakket', package_price: 0, guest_name: id, guest_email: `${id}@example.test`, user_id: null });
test('prioritizes new requests oldest first and supports contact search', () => {
  render(React.createElement(AanvragenClient, { initialRequests: [request('closed', 'accepted', '2026-01-03'), request('newer', 'pending', '2026-01-02'), request('oldest', 'pending', '2026-01-01')] }));
  const cards = screen.getAllByRole('button', { expanded: false });
  expect(cards[0].textContent).toContain('oldest');
  fireEvent.change(screen.getByRole('searchbox', { name: 'Zoek aanvragen' }), { target: { value: 'newer@example.test' } });
  expect(screen.queryByText('oldest')).toBeNull();
  expect(screen.getByText('newer')).toBeTruthy();
});
test('rejected request controls are separate accessible buttons', () => {
  render(React.createElement(AanvragenClient, { initialRequests: [request('rejected', 'rejected', '2026-01-01')] }));
  const deletion = screen.getByRole('button', { name: 'Verwijderen' });
  expect(deletion.parentElement.closest('button')).toBeNull();
});
test('failed save keeps the request open and exposes a useful error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'unavailable' }) }));
  render(React.createElement(AanvragenClient, { initialRequests: [request('oldest', 'pending', '2026-01-01')] }));
  fireEvent.click(screen.getByRole('button', { name: /oldest/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('niet'));
  expect(screen.getByRole('button', { name: 'Opslaan' }).disabled).toBe(false);
  expect(screen.getByRole('textbox', { name: 'Interne notitie' })).toBeTruthy();
});
