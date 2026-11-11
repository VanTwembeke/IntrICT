import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import UsersPage from '../src/app/dashboard/users/page';
const db = vi.hoisted(() => ({ getUser: vi.fn(), single: vi.fn(), list: vi.fn(), refresh: vi.fn(), from: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: (path) => { throw new Error('REDIRECT:' + path); }, useRouter: () => ({ refresh: db.refresh }) }));
vi.mock('../src/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: db.getUser }, from: db.from }) }));
vi.mock('../src/app/dashboard/users/UsersTable', () => ({ default: ({ users }) => React.createElement('div', { 'data-testid': 'users' }, users.length ? users.map(u => u.email).join(',') : 'Geen gebruikers gevonden.') }));
beforeEach(() => {
 db.getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } } });
 db.single.mockResolvedValue({ data: { role: 'admin' }, error: null });
 db.list.mockResolvedValue({ data: [], error: null });
 db.from.mockImplementation(() => ({ select: () => ({ eq: () => ({ single: db.single }), order: () => ({ returns: db.list }) }) }));
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
test('query failure is an honest source error with working retry, never empty success', async () => {
 db.list.mockResolvedValue({ data: null, error: { message: 'private database detail' } });
 render(await UsersPage());
 expect(screen.getByRole('alert').textContent).toContain('Gebruikers konden niet worden geladen');
 expect(screen.queryByText('Geen gebruikers gevonden.')).toBeNull();
 expect(screen.queryByText(/private database detail/)).toBeNull();
 fireEvent.click(screen.getByRole('button', { name: 'Opnieuw proberen' }));
 expect(db.refresh).toHaveBeenCalledTimes(1);
});

for (const data of [null, {}, [null], [{}], [{ id: 'x', email: 123, role: 'user', created_at: '2026-01-01' }]]) {
 test('invalid list response is not success: ' + JSON.stringify(data), async () => {
  db.list.mockResolvedValue({ data, error: null });
  render(await UsersPage());
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.queryByTestId('users')).toBeNull();
 });
}
test('successful empty response alone renders the empty list', async () => {
 render(await UsersPage()); expect(screen.getByText('Geen gebruikers gevonden.')).toBeTruthy(); expect(screen.queryByRole('alert')).toBeNull();
});
test('successful admin list renders existing users', async () => {
 db.list.mockResolvedValue({ data: [{ id: 'u', email: 'client@example.test', role: 'user', created_at: '2026-01-01' }], error: null });
 render(await UsersPage()); expect(screen.getByText('client@example.test')).toBeTruthy();
});
test('transport rejection shows recoverable error', async () => {
 db.list.mockRejectedValue(new Error('private transport detail'));
 render(await UsersPage()); expect(screen.getByRole('alert')).toBeTruthy();
});
test('ordinary user is redirected before any user-list read', async () => {
 db.single.mockResolvedValue({ data: { role: 'user' }, error: null });
 await expect(UsersPage()).rejects.toThrow('REDIRECT:/dashboard'); expect(db.list).not.toHaveBeenCalled();
});
test('guest is redirected before any profile read', async () => {
 db.getUser.mockResolvedValue({ data: { user: null } });
 await expect(UsersPage()).rejects.toThrow('REDIRECT:/login'); expect(db.from).not.toHaveBeenCalled();
});
