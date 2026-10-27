import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AbonneesClient from '../src/app/dashboard/nieuwsbrief/AbonneesClient';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const subscriber = { id: '8c4a9ef0-7882-4dcf-b6e9-59de098f228a', email: 'fixture@example.test', is_active: true, subscribed_at: '2026-01-01', unsubscribed_at: null };
test('HTTP load errors are not an empty list and retry recovers', async () => {
 const fetch = vi.fn().mockResolvedValueOnce({ ok: false, json: async () => [] }).mockResolvedValueOnce({ ok: true, json: async () => [subscriber] });
 vi.stubGlobal('fetch', fetch); render(React.createElement(AbonneesClient));
 await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Abonnees konden niet worden geladen.'));
 expect(screen.queryByText('Nog geen abonnees.')).toBeNull();
 fireEvent.click(screen.getByRole('button', { name: 'Opnieuw proberen' }));
 await waitFor(() => expect(screen.getByText(subscriber.email)).toBeTruthy());
});

test.each(['http', 'network', 'unconfirmed'])('failed %s deletion retains the row and shows safe feedback', async (kind) => {
 vi.spyOn(window, 'confirm').mockReturnValue(true);
 const fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [subscriber] });
 if (kind === 'network') fetch.mockRejectedValueOnce(new Error('private detail'));
 else fetch.mockResolvedValueOnce({ ok: kind !== 'http', json: async () => ({ error: 'private detail' }) });
 vi.stubGlobal('fetch', fetch); render(React.createElement(AbonneesClient));
 await screen.findByText(subscriber.email);
 fireEvent.click(screen.getByRole('button', { name: /Verwijder/ }));
 await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Verwijdering niet bevestigd.'));
 expect(screen.getByText(subscriber.email)).toBeTruthy();
 expect(screen.queryByText(/private detail/)).toBeNull();
 expect(screen.getByRole('button', { name: /Verwijder/ }).disabled).toBe(false);
});

const inactive = { ...subscriber, id: '9c4a9ef0-7882-4dcf-b6e9-59de098f228a', email: 'former@example.test', is_active: false };
test('email search and status filter intersect without changing overview totals or data', async () => {
 const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [subscriber, inactive] });
 vi.stubGlobal('fetch', fetch); render(React.createElement(AbonneesClient));
 await screen.findByText(subscriber.email);
 fireEvent.change(screen.getByRole('searchbox', { name: 'Zoek op e-mailadres' }), { target: { value: '  FIXTURE@  ' } });
 expect(screen.getByText(subscriber.email)).toBeTruthy(); expect(screen.queryByText(inactive.email)).toBeNull();
 fireEvent.change(screen.getByRole('combobox', { name: 'Filter op status' }), { target: { value: 'inactive' } });
 expect(screen.queryByText(subscriber.email)).toBeNull(); expect(screen.getByText('Geen abonnees voor deze filters.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button', { name: 'Filters wissen' }));
 expect(screen.getByText(subscriber.email)).toBeTruthy(); expect(screen.getByText(inactive.email)).toBeTruthy();
 expect(fetch).toHaveBeenCalledTimes(1);
});
test.each([{}, [{ ...subscriber, email: null }], [{ ...subscriber, is_active: 'false' }], [{ ...subscriber, subscribed_at: 'invalid' }], [{ ...subscriber, id: '' }], [subscriber, subscriber]])('malformed load data %j fails visibly rather than rendering empty or crashing', async (data) => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
 render(React.createElement(AbonneesClient));
 await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Abonnees konden niet worden geladen.'));
 expect(screen.queryByText('Nog geen abonnees.')).toBeNull();
});
test('cancelling deletion performs no write and confirmation identifies exact email', async () => {
 const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
 const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [subscriber] });
 vi.stubGlobal('fetch', fetch); render(React.createElement(AbonneesClient)); await screen.findByText(subscriber.email);
 fireEvent.click(screen.getByRole('button', { name: /Verwijder/ }));
 expect(confirm).toHaveBeenCalledWith(expect.stringContaining(subscriber.email)); expect(fetch).toHaveBeenCalledTimes(1);
});
test('pending delete blocks duplicate writes and only removes the confirmed target', async () => {
 vi.spyOn(window, 'confirm').mockReturnValue(true); let resolveDelete;
 const fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [subscriber, inactive] }).mockImplementationOnce(() => new Promise(resolve => { resolveDelete = resolve; }));
 vi.stubGlobal('fetch', fetch); render(React.createElement(AbonneesClient)); await screen.findByText(subscriber.email);
 const button = screen.getByRole('button', { name: 'Verwijder ' + subscriber.email }); fireEvent.click(button); fireEvent.click(button);
 expect(screen.getByRole('button', { name: 'Verwijder ' + inactive.email }).disabled).toBe(true); expect(fetch).toHaveBeenCalledTimes(2);
 expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ id: subscriber.id });
 resolveDelete({ ok: true, json: async () => ({ ok: true }) });
 await waitFor(() => expect(screen.queryByText(subscriber.email)).toBeNull());
 expect(screen.getByText(inactive.email)).toBeTruthy(); expect(screen.getByRole('status').textContent).toContain('Abonnee verwijderd.');
});

test('a valid empty response is distinct from an unavailable source', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
 render(React.createElement(AbonneesClient)); await screen.findByText('Nog geen abonnees.');
 expect(screen.queryByRole('alert')).toBeNull();
});
