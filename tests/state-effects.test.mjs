import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ESLint } from 'eslint';
import { renderToStaticMarkup } from 'react-dom/server';
import Invoice from '../src/app/dashboard/facturen/nieuw/NieuweFactuurClient';
import Contract from '../src/app/dashboard/contracten/nieuw/NieuwContractClient';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const lint = async (path) => {
  const results = await new ESLint().lintFiles([path]);
  expect(results.flatMap(r => r.messages.filter(m => m.severity === 2))).toEqual([]);
};

test('service selection replaces named defaults but preserves custom description for other service', async () => {
  const view = render(React.createElement(Contract, { dossiers: [] }));
  const description = view.container.querySelector('textarea');
  expect(description.value).toContain('Overname');
  fireEvent.click(view.getByRole('button', { name: 'Hosting', exact: true }));
  expect(description.value).toContain('Hostingbeheer');
  fireEvent.change(description, { target: { value: 'Eigen omschrijving' } });
  fireEvent.click(view.getByRole('button', { name: 'Andere dienst', exact: true }));
  expect(description.value).toBe('Eigen omschrijving');
  await lint('src/app/dashboard/contracten/nieuw/NieuwContractClient.tsx');
});

const dossiers = [{ id: 'd1', profile_id: 'p1', guest_name: 'Fixture klant' }, { id: 'd2', guest_name: 'Andere fixture' }];
test('invoice preselection is available on first render for dossier/profile ids; linked invoice wins', async () => {
  for (const preselectedClientId of ['d1', 'p1']) {
    const html = renderToStaticMarkup(React.createElement(Invoice, { dossiers, availablePackages: [], preselectedClientId }));
    expect(html).toContain('value="d1" selected=""');
  }
  const view = render(React.createElement(Invoice, { dossiers, availablePackages: [], preselectedClientId: 'p1', linkedInvoice: { dossier_id: 'd2' } }));
  expect(view.container.querySelector('select').value).toBe('d2');
  await lint('src/app/dashboard/facturen/nieuw/NieuweFactuurClient.tsx');
});

test('invoice date change adds 30 calendar days and manual due-date overrides remain editable', () => {
  const view = render(React.createElement(Invoice, { dossiers, availablePackages: [] }));
  const [issue, due] = view.container.querySelectorAll('input[type="date"]');
  fireEvent.change(issue, { target: { value: '2028-02-01' } });
  expect(due.value).toBe('2028-03-02');
  fireEvent.change(due, { target: { value: '2028-04-01' } });
  expect(due.value).toBe('2028-04-01');
  fireEvent.change(issue, { target: { value: '2028-12-15' } });
  expect(due.value).toBe('2029-01-14');
  fireEvent.change(issue, { target: { value: '' } });
  expect(due.value).toBe('');
});

test('credit note retains negative line calculation, preselected dossier and date payload', async () => {
  const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'fixture-response' }) });
  vi.stubGlobal('fetch', request);
  const view = render(React.createElement(Invoice, {
    dossiers, availablePackages: [], isCreditNote: true, preselectedClientId: 'p1',
    linkedInvoice: { id: 'fixture-invoice', dossier_id: 'd2', invoice_number: 'FIXTURE', items: [{ description: 'Fixture dienst', quantity: 2, unit_price: 100 }] },
  }));
  expect(view.getByText('€-242,00')).toBeTruthy();
  const [issue, due] = view.container.querySelectorAll('input[type="date"]');
  fireEvent.change(issue, { target: { value: '2028-02-01' } });
  fireEvent.change(due, { target: { value: '2028-04-01' } });
  await act(async () => fireEvent.click(view.getByRole('button', { name: 'Concept', exact: true })));
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  expect(request.mock.calls[0][0]).toBe('/api/invoices');
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
    type: 'credit_note', linked_invoice_id: 'fixture-invoice', status: 'draft', send_email: false,
    issue_date: '2028-02-01', due_date: '2028-04-01', vat_rate: 21, notes: null, language: 'nl',
    is_recurring: false, recurring_interval: null, dossier_id: 'd2', profile_id: null,
    items: [{ description: 'Fixture dienst', notes: null, quantity: 2, unit_price: -100, total: -200, package_id: null }],
  });
});

test('missing or unmatched invoice preselection does not select a dossier by an absent profile id', () => {
  for (const preselectedClientId of [undefined, 'absent']) {
    const view = render(React.createElement(Invoice, { dossiers, availablePackages: [], preselectedClientId }));
    expect(view.container.querySelector('select').value).toBe('');
    view.unmount();
  }
});
