import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UsersTable from '../src/app/dashboard/users/UsersTable';

const db = vi.hoisted(() => ({ single: vi.fn() }));
vi.mock('../src/lib/supabase/client', () => ({ createClient: () => ({ from: () => ({ update: () => ({ eq: () => ({ select: () => ({ single: db.single }) }) }) }) }) }));
const me = { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.test', full_name: 'Administrator', role: 'admin', created_at: '2026-01-01' };
const sirat = { id: '22222222-2222-4222-8222-222222222222', email: 'sir at@example.test', full_name: 'Sirat', company: 'Example', role: 'user', created_at: '2026-01-01' };
// jsdom lacks dialog top-layer methods. Model open/close and close event,
// rather than making closed dialogs accessible or changing production code.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    if (!this.isConnected) throw new DOMException('Dialog is not connected', 'InvalidStateError');
    this.open = true;
    this.querySelector('[autofocus], input, button')?.focus();
  };
  HTMLDialogElement.prototype.close = function (returnValue = '') {
    if (!this.open) return;
    this.returnValue = returnValue;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
function setup() { render(React.createElement(UsersTable, { users: [me, sirat], currentUserId: me.id })); }

test('revoke access requires exact UUID, verifies disabled status, and retains client row', async () => {
  setup();
  fetch.mockResolvedValue(new Response(JSON.stringify({ id: sirat.id, status: 'disabled_not_deleted', banned_until: '2126-01-01T00:00:00Z' })));
  fireEvent.click(screen.getByRole('button', { name: 'Toegang intrekken' }));
  const dialog = screen.getByRole('dialog', { name: 'Toegang intrekken' });
  expect(within(dialog).getByText(/niets verwijderd/)).toBeTruthy();
  const confirm = within(dialog).getByRole('button', { name: 'Intrekking bevestigen' });
  expect(confirm.disabled).toBe(true);
  fireEvent.change(within(dialog).getByLabelText('Toegangsbevestiging-ID'), { target: { value: sirat.id + ' ' } });
  expect(confirm.disabled).toBe(true);
  fireEvent.change(within(dialog).getByLabelText('Toegangsbevestiging-ID'), { target: { value: sirat.id } });
  fireEvent.click(confirm);
  await waitFor(() => expect(screen.getByText(/Toegang ingetrokken tot/)).toBeTruthy());
  expect(fetch).toHaveBeenCalledWith('/api/admin/users/' + sirat.id + '/access', expect.objectContaining({ method: 'POST', body: JSON.stringify({ confirmationId: sirat.id }) }));
  expect(screen.getByText(sirat.email)).toBeTruthy();
  expect(screen.getByText('Sirat')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Toegang intrekken' }).disabled).toBe(true);
});
test('access readback checks exact target after refresh, without deleting client', async () => {
  setup();
  fetch.mockResolvedValue(new Response(JSON.stringify({ id: sirat.id, status: 'disabled_not_deleted', banned_until: '2126-01-01T00:00:00Z' })));
  fireEvent.click(screen.getByRole('button', { name: 'Toegangsstatus controleren' }));
  await waitFor(() => expect(screen.getByText(/Toegang ingetrokken tot/)).toBeTruthy());
  expect(fetch).toHaveBeenCalledWith('/api/admin/users/' + sirat.id + '/access', expect.objectContaining({ method: 'GET', cache: 'no-store' }));
  expect(screen.getByText('Sirat')).toBeTruthy();
});
test('access dialog cancel closes without request and restores trigger focus', () => {
  setup();
  const trigger = screen.getByRole('button', { name: 'Toegang intrekken' });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Toegang intrekken' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Annuleren' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(fetch).not.toHaveBeenCalled();
});
test('self and admin have no access revocation action', () => {
  setup();
  expect(within(screen.getByText(me.email).closest('tr')).queryByRole('button', { name: 'Toegang intrekken' })).toBeNull();
});
for (const body of [
  { id: me.id, status: 'disabled_not_deleted', banned_until: '2126-01-01T00:00:00Z' },
  { id: sirat.id, status: 'deleted', banned_until: '2126-01-01T00:00:00Z' },
  { id: sirat.id, status: 'disabled_not_deleted', banned_until: '2000-01-01' },
]) {
  test('unexpected access response is never optimistic success: ' + JSON.stringify(body), async () => {
    setup(); fetch.mockResolvedValue(new Response(JSON.stringify(body)));
    fireEvent.click(screen.getByRole('button', { name: 'Toegang intrekken' }));
    const dialog = screen.getByRole('dialog', { name: 'Toegang intrekken' });
    fireEvent.change(within(dialog).getByLabelText('Toegangsbevestiging-ID'), { target: { value: sirat.id } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Intrekking bevestigen' }));
    await waitFor(() => expect(within(dialog).getByRole('alert').textContent).toContain('niet bevestigd'));
    expect(screen.queryByText(/Toegang ingetrokken tot/)).toBeNull();
    expect(screen.getByText('Sirat', { selector: 'p' })).toBeTruthy();
  });
}

test('search and role filter select exact visible users', () => {
  setup();
  fireEvent.change(screen.getByLabelText('Zoek gebruikers'), { target: { value: 'Sirat' } });
  expect(screen.getByText('Sirat')).toBeTruthy();
  expect(screen.queryByText('admin@example.test')).toBeNull();
  fireEvent.change(screen.getByLabelText('Filter op rol'), { target: { value: 'admin' } });
  expect(screen.queryByText('Sirat')).toBeNull();
  expect(screen.getByText('Geen gebruikers gevonden.')).toBeTruthy();
});
test('self and admin have no delete action', () => {
  setup();
  const row = screen.getByText('admin@example.test').closest('tr');
  expect(within(row).queryByRole('button', { name: 'Verwijderen' })).toBeNull();
});
test('confirmation requires exact ID and blocker keeps target visible', async () => {
  setup();
  fetch.mockResolvedValue(new Response(JSON.stringify({ code: 'RETENTION_REVIEW_REQUIRED', error: 'Databasecontrole vereist. Er is niets gewijzigd.' }), { status: 409 }));
  fireEvent.click(screen.getByRole('button', { name: 'Verwijderen' }));
  const dialog = screen.getByRole('dialog', { name: 'Gebruiker verwijderen' });
  const confirm = within(dialog).getByRole('button', { name: 'Verwijdering bevestigen' });
  expect(confirm.disabled).toBe(true);
  fireEvent.change(within(dialog).getByLabelText('Bevestigings-ID'), { target: { value: sirat.id } });
  fireEvent.click(confirm);
  await waitFor(() => expect(within(dialog).getByRole('alert').textContent).toContain('Er is niets gewijzigd'));
  expect(fetch).toHaveBeenCalledWith('/api/admin/users/' + sirat.id, expect.objectContaining({ method: 'DELETE', body: JSON.stringify({ confirmationId: sirat.id }) }));
  expect(screen.getByText(sirat.email, { selector: 'p' })).toBeTruthy();
});
test('profile update failure is visible, never optimistic success', async () => {
  db.single.mockResolvedValue({ data: null, error: { message: 'Opslaan geweigerd' } });
  setup();
  fireEvent.click(within(screen.getByText(sirat.email).closest('tr')).getByRole('button', { name: 'Bewerken' }));
  fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Opslaan geweigerd'));
  expect(screen.queryByText('Wijzigingen opgeslagen!')).toBeNull();
});
test('role update failure preserves original role', async () => {
  db.single.mockResolvedValue({ data: null, error: { message: 'Rol geweigerd' } });
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Admin maken' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Rol geweigerd'));
  expect(screen.getByRole('button', { name: 'Admin maken' })).toBeTruthy();
});
