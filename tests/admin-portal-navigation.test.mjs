import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import DashboardSidebar from '../src/components/dashboard/DashboardSidebar';
import DashboardShell from '../src/components/dashboard/DashboardShell';
vi.mock('@/components/dashboard/ChatWidget', () => ({ default: () => null }));
const state = vi.hoisted(() => ({ pathname: '/dashboard/pakketten/beheer', unreadCount: 0, openChat: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname, useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/contexts/ChatContext', () => ({ ChatProvider: ({ children }) => children, useChatContext: () => ({ unreadCount: state.unreadCount, openChat: state.openChat }) }));
vi.mock('@/hooks/usePendingRequestsCount', () => ({ usePendingRequestsCount: () => 0 }));
vi.mock('@/hooks/usePendingAppointmentsCount', () => ({ usePendingAppointmentsCount: () => 0 }));
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }));
const profile = { role: 'admin', email: 'test@example.test', full_name: 'Test' };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
test('desktop breakpoint closes an open mobile modal and restores body scroll', () => {
  let change;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: (_name, listener) => { change = listener; }, removeEventListener: vi.fn() })));
  render(React.createElement(DashboardSidebar, { profile }));
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  fireEvent.click(trigger);
  act(() => change?.({ matches: true }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(document.body.style.overflow).toBe('');
});
test('native close event synchronizes the menu state', () => {
  render(React.createElement(DashboardSidebar, { profile }));
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog');
  dialog.removeAttribute('open');
  fireEvent(dialog, new Event('close'));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
test('a delayed native close event does not dismiss a currently open modal', () => {
  render(React.createElement(DashboardSidebar, { profile }));
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  fireEvent.click(trigger);
  fireEvent(screen.getByRole('dialog'), new Event('close'));
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
});
test('account subroutes select their parent without prefix collisions', () => {
  state.pathname = '/dashboard/settings/security';
  const { rerender } = render(React.createElement(DashboardSidebar, { profile }));
  expect(screen.getByRole('link', { name: 'Instellingen' }).getAttribute('aria-current')).toBe('page');
  state.pathname = '/dashboard/settings-other';
  rerender(React.createElement(DashboardSidebar, { profile }));
  expect(screen.getByRole('link', { name: 'Instellingen' }).getAttribute('aria-current')).toBeNull();
});
test('shell gives safe detail breadcrumbs and a keyboard skip target', () => {
  state.pathname = '/dashboard/klanten/private-record-id';
  render(React.createElement(DashboardShell, { profile }, React.createElement('h1', null, 'Dossier')));
  const trail = screen.getByRole('navigation', { name: 'Kruimelpad' });
  expect(trail.textContent).toContain('Klanten');
  expect(trail.textContent).toContain('Detail');
  expect(trail.textContent).not.toContain('private-record-id');
  expect(screen.getByRole('link', { name: 'Ga naar inhoud' }).getAttribute('href')).toBe('#portal-content');
  expect(screen.getByRole('main').id).toBe('portal-content');
});
beforeEach(() => {
  state.unreadCount = 0;
  state.openChat.mockClear();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  state.pathname = '/dashboard/pakketten/beheer';
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); this.querySelector('button').focus(); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
test('nested routes have an accessible active parent without prefix collisions', () => {
  render(React.createElement(DashboardSidebar, { profile }));
  expect(screen.getAllByRole('link', { name: /Pakketten/ })[0].getAttribute('aria-current')).toBe('page');
});
test('unread chat action is a named button separate from the messages link', () => {
  state.unreadCount = 3;
  render(React.createElement(DashboardSidebar, { profile }));
  const chat = screen.getByRole('button', { name: 'Open chat: 3 ongelezen berichten' });
  expect(chat.closest('a')).toBeNull();
  fireEvent.click(chat);
  expect(state.openChat).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: 'Berichten' }).getAttribute('href')).toBe('/dashboard/messages');
});
test('mobile menu exposes modal state, locks scroll and restores focus on Escape', () => {
  render(React.createElement(DashboardSidebar, { profile }));
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  fireEvent.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  const dialog = screen.getByRole('dialog', { name: 'Portaalnavigatie' });
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(trigger);
});
