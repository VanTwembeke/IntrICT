import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AanvragenClient from '../src/app/dashboard/aanvragen/AanvragenClient';
vi.mock('framer-motion', () => ({ AnimatePresence: ({ children }) => children, motion: { div: ({ children, layout, initial, animate, exit, transition, ...props }) => { void layout; void initial; void animate; void exit; void transition; return React.createElement('div', props, children); } } }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });
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

 test('shows request age and explicit new-first queue guidance at opening', () => {
  vi.setSystemTime(new Date('2026-11-13T12:00:00Z'));
  render(React.createElement(AanvragenClient, { initialRequests: [request('oldest', 'pending', '2026-11-10T12:00:00Z')] }));
  expect(screen.getByText('3 dagen geleden')).toBeTruthy();
  expect(screen.getByText(/Nieuwe aanvragen eerst, oudste bovenaan/)).toBeTruthy();
  vi.useRealTimers();
 });

test('draft status stays distinct from saved badge and success waits for confirmation', async () => {
 let resolve; const response = new Promise(r => { resolve = r; });
 const fetch = vi.fn(() => response); vi.stubGlobal('fetch', fetch);
 const req = request('oldest', 'pending', '2026-01-01');
 render(React.createElement(AanvragenClient, { initialRequests: [req] }));
 const card = screen.getByRole('button', { expanded: false }); fireEvent.click(card);
 fireEvent.click(screen.getByRole('button', { name: 'Gecontacteerd', exact: true }));
 expect(card.textContent).toContain('Nieuw');
 expect(card.textContent).not.toContain('Gecontacteerd');
 fireEvent.change(screen.getByRole('textbox', { name: 'Interne notitie' }), { target: { value: '  bewaar dit concept  ' } });
 fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }));
 expect(screen.queryByRole('status')).toBeNull();
 expect(screen.getByRole('textbox', { name: 'Interne notitie' }).disabled).toBe(true);
 expect(screen.getByRole('button', { name: 'Gecontacteerd', exact: true }).disabled).toBe(true);
 resolve({ ok: true, json: async () => ({ ...req, status: 'contacted', admin_notes: '  bewaar dit concept  ' }) });
 await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Opgeslagen'));
 expect(card.textContent).toContain('Gecontacteerd');
 expect(fetch).toHaveBeenCalledTimes(1);
 expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({status:'contacted',admin_notes:'  bewaar dit concept  '});
});
test.each([
 ['wrong target', { id:'other',status:'contacted',admin_notes:'concept' }],
 ['wrong status', { id:'oldest',status:'pending',admin_notes:'concept' }],
 ['wrong notes', { id:'oldest',status:'contacted',admin_notes:'changed' }],
 ['error-bearing', { id:'oldest',status:'contacted',admin_notes:'concept',error:'failed' }],
 ['empty', {}], ['null',null], ['array',[]],
])('unconfirmed %s success preserves draft and saved status', async (_label, result) => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true,json:async()=>result}));
 render(React.createElement(AanvragenClient, {initialRequests:[request('oldest','pending','2026-01-01')]}));
 const card = screen.getByRole('button',{expanded:false}); fireEvent.click(card);
 fireEvent.click(screen.getByRole('button',{name:'Gecontacteerd',exact:true}));
 fireEvent.change(screen.getByRole('textbox',{name:'Interne notitie'}),{target:{value:'concept'}});
 fireEvent.click(screen.getByRole('button',{name:'Opslaan'}));
 await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('niet'));
 expect(screen.getByRole('textbox',{name:'Interne notitie'}).value).toBe('concept');
 expect(card.textContent).toContain('Nieuw'); expect(screen.queryByRole('status')).toBeNull();
});

test('same-render save entry dispatches only one request', async () => {
 const fetch = vi.fn(() => new Promise(()=>{})); vi.stubGlobal('fetch',fetch);
 render(React.createElement(AanvragenClient,{initialRequests:[request('oldest','pending','2026-01-01')]}));
 fireEvent.click(screen.getByRole('button',{expanded:false}));
 const button=screen.getByRole('button',{name:'Opslaan'});
 const props=button[Object.keys(button).find(k=>k.startsWith('__reactProps$'))];
 props.onClick(); props.onClick();
 expect(fetch).toHaveBeenCalledTimes(1);
});

test.each(['transport','invalid-json'])('uncertain %s keeps notes without automatic replay', async (mode) => {
 const fetch=vi.fn(mode==='transport' ? ()=>Promise.reject(Error('offline')) : async()=>({ok:true,json:async()=>{throw Error('JSON')}}));vi.stubGlobal('fetch',fetch);
 render(React.createElement(AanvragenClient,{initialRequests:[request('oldest','pending','2026-01-01')]}));
 fireEvent.click(screen.getByRole('button',{expanded:false}));
 fireEvent.change(screen.getByRole('textbox',{name:'Interne notitie'}),{target:{value:'retain'}});
 fireEvent.click(screen.getByRole('button',{name:'Opslaan'}));
 await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('niet bevestigd'));
 expect(screen.getByRole('textbox',{name:'Interne notitie'}).value).toBe('retain');
 expect(fetch).toHaveBeenCalledTimes(1);expect(screen.queryByRole('status')).toBeNull();
});
test('null or future dates avoid negative/NaN age and empty notes can be confirmed',async()=>{
 vi.setSystemTime(new Date('2026-11-13T12:00:00Z'));
 const req=request('oldest','pending','invalid');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({...req,admin_notes:''})}));
 const {unmount}=render(React.createElement(AanvragenClient,{initialRequests:[req]}));
 expect(screen.getByText('Datum onbekend')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{expanded:false}));fireEvent.click(screen.getByRole('button',{name:'Opslaan'}));
 await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('Opgeslagen'));
 unmount();render(React.createElement(AanvragenClient,{initialRequests:[request('future','pending','2027-01-01')]}));
 expect(screen.getByText('Minder dan een dag geleden')).toBeTruthy();
});
