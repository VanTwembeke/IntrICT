import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import DashboardPage from '../src/app/dashboard/page';
let role = 'user';
let failure = false;
let rejected = false;
vi.mock('next/navigation', () => ({ redirect: vi.fn(), usePathname: () => '/dashboard' }));
vi.mock('../src/components/dashboard/AdminOnly', () => ({ default: ({children}) => children }));
vi.mock('../src/lib/supabase/server', () => ({ createClient: async () => ({
 auth: { getUser: async () => ({data:{user:{id:'fixture'}}}) },
 from: (table) => { const q = { select:()=>q, eq:()=>q, in:()=>q, gte:()=>q, order:()=>q, limit:()=>q,
 maybeSingle: async()=>({ data:{id:'fixture',role,full_name:'Voorbeeld Klant',email:'fixture@example.test'} }),
 then: (resolve, reject) => rejected ? reject(new Error('private provider detail')) : resolve({data:[],count:0,error:failure ? {message:'private provider detail'} : null}) }; return q; }
}) }));
afterEach(() => {cleanup(); failure=false; rejected=false;});
test('ordinary account starts with its own work, not administrative routes', async () => {
 role='user'; render(await DashboardPage());
 expect(screen.getByRole('heading',{name:'Wat wil je regelen?'})).toBeTruthy();
 expect(screen.getByRole('link',{name:/Bekijk mijn facturen/}).getAttribute('href')).toBe('/dashboard/mijn-facturen');
 expect(screen.queryByRole('link',{name:/Aanvragen behandelen/})).toBeNull();
});

test.each(['admin','user','klant'])('source failures for %s are not empty or zero statistics', async (value) => {
 role=value; failure=true; render(await DashboardPage());
 expect(screen.getByRole('alert').textContent).toContain('Overzicht tijdelijk niet beschikbaar');
 expect(screen.queryByText('Geen aanvragen gevonden.')).toBeNull();
 expect(screen.queryByText('private provider detail')).toBeNull();
 expect(screen.getByRole('link',{name:'Overzicht opnieuw laden'}).getAttribute('href')).toBe('/dashboard');
});
test('network rejection is a visible failure rather than an empty dashboard', async()=>{
 role='user'; rejected=true; render(await DashboardPage());
 expect(screen.getByRole('alert')).toBeTruthy();
});
test('admin starts with actionable work before the metrics', async()=>{
 role='admin'; render(await DashboardPage());
 expect(screen.getByRole('heading',{name:'Aan de slag'})).toBeTruthy();
 expect(screen.getByRole('link',{name:/Aanvragen behandelen/}).getAttribute('href')).toBe('/dashboard/aanvragen');
 expect(screen.queryByRole('link',{name:/Bekijk mijn facturen/})).toBeNull();
});
test('client has the same private account tasks as an ordinary user', async()=>{
 role='klant'; render(await DashboardPage());
 expect(screen.getByRole('link',{name:/Bekijk mijn contracten/})).toBeTruthy();
 expect(screen.queryByRole('link',{name:/Klantdossiers openen/})).toBeNull();
});

test('a successfully empty account explains invoices and appointments without hiding next steps',async()=>{
 role='user'; render(await DashboardPage());
 expect(screen.getByText('Geen openstaande facturen')).toBeTruthy();
 expect(screen.getByText('Nog geen afspraken gepland')).toBeTruthy();
 expect(screen.getByRole('link',{name:'Ontdek de pakketten'})).toBeTruthy();
 expect(screen.queryByRole('alert')).toBeNull();
});
