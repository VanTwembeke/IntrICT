import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import DashboardPage from '../src/app/dashboard/page';
let role = 'user';
let requests = [];
let requestFilters = [];
let failure = false;
let rejected = false;
vi.mock('next/navigation', () => ({ redirect: vi.fn(), usePathname: () => '/dashboard' }));
vi.mock('../src/components/dashboard/AdminOnly', () => ({ default: ({children}) => children }));
vi.mock('../src/lib/supabase/server', () => ({ createClient: async () => ({
 auth: { getUser: async () => ({data:{user:{id:'fixture'}}}) },
 from: (table) => { const q = { select:()=>q, eq:(key,value)=>{ if(table === 'package_requests') requestFilters.push([key,value]); return q; }, in:()=>q, gte:()=>q, order:()=>q, limit:()=>q,
 maybeSingle: async()=>({ data:{id:'fixture',role,full_name:'Voorbeeld Klant',email:'fixture@example.test'} }),
 then: (resolve, reject) => rejected ? reject(new Error('private provider detail')) : resolve({data:table === 'package_requests' ? requests : [],count:0,error:failure ? {message:'private provider detail'} : null}) }; return q; }
}) }));
afterEach(() => {cleanup(); failure=false; rejected=false; requests=[]; requestFilters=[];});
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

 test('own pending request explains the next step and links to existing messages', async()=>{
 role='user'; requests=[{id:'request-1', package_name:'Website',package_price:100,status:'pending',created_at:'2026-11-12T12:00:00Z'}];
 render(await DashboardPage());
 expect(screen.getByText('Je aanvraag is ontvangen. Heb je nog informatie of een vraag? Stuur ons een bericht.')).toBeTruthy();
 expect(screen.getByRole('link',{name:'Bespreek je aanvraag'}).getAttribute('href')).toBe('/dashboard/messages');
 expect(requestFilters).toContainEqual(['user_id','fixture']);
 });

 test.each([
 ['contacted','Bekijk de afspraken in je berichten. Is iets onduidelijk? Vraag ons om toelichting.'],
 ['accepted','Je aanvraag is geaccepteerd. Bespreek de praktische vervolgstappen via je berichten.'],
 ['rejected','Je aanvraag is niet weerhouden. Wil je een alternatief bespreken? Neem contact op via je berichten.'],
 ['future-status','De status van je aanvraag is gewijzigd. Vraag ons via je berichten om toelichting.'],
 ])('request %s has an accurate next step without unverified promises',async(status,guidance)=>{
 role='klant';requests=[{id:'r',package_name:'Website',package_price:100,status,created_at:'2026-11-12T12:00:00Z'}];
 render(await DashboardPage());expect(screen.getByText(guidance)).toBeTruthy();
 expect(screen.getByRole('link',{name:'Bespreek je aanvraag'}).getAttribute('href')).toBe('/dashboard/messages');
 });

 test.each([null,{},[null],[{}],[{id:'r',package_name:'Website',package_price:'100',status:'pending',created_at:'2026-11-12'}]])('invalid requests are unavailable, never empty or actionable success: %j',async(data)=>{
 role='user';requests=data;render(await DashboardPage());
 expect(screen.getByRole('alert').textContent).toContain('Overzicht tijdelijk niet beschikbaar');
 expect(screen.queryByText('Nog geen aanvragen')).toBeNull();
 expect(screen.queryByRole('link',{name:'Bespreek je aanvraag'})).toBeNull();
 });
 test('inherited object keys in a status use the unknown-status fallback',async()=>{
 role='user';requests=[{id:'r',package_name:'Website',package_price:100,status:'constructor',created_at:'2026-11-12'}];render(await DashboardPage());
 expect(screen.getByText('De status van je aanvraag is gewijzigd. Vraag ons via je berichten om toelichting.')).toBeTruthy();
 });
