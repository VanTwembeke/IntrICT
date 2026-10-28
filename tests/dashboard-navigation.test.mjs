import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../src/components/dashboard/DashboardSidebar';
let path='/dashboard/facturen/fixture';
vi.mock('next/navigation',()=>({usePathname:()=>path,useRouter:()=>({push:vi.fn(),refresh:vi.fn()})}));
vi.mock('../src/lib/supabase/client',()=>({createClient:()=>({auth:{signOut:vi.fn()}})}));
vi.mock('../src/contexts/ChatContext',()=>({useChatContext:()=>({unreadCount:0,openChat:vi.fn()})}));
vi.mock('../src/hooks/usePendingRequestsCount',()=>({usePendingRequestsCount:()=>0}));
vi.mock('../src/hooks/usePendingAppointmentsCount',()=>({usePendingAppointmentsCount:()=>0}));
vi.mock('../src/components/dashboard/DashboardShell',()=>({useViewMode:()=>({viewAs:'admin',setViewAs:vi.fn()})}));
afterEach(cleanup);
window.matchMedia=()=>({addEventListener:vi.fn(),removeEventListener:vi.fn()});
const profile={id:'fixture',full_name:'Voorbeeld',email:'fixture@example.test',role:'admin'};
test('admin navigation has distinct work, financial and management groups and one active ancestor',()=>{
 render(React.createElement(Sidebar,{profile}));
 for(const name of ['Werkruimte','Financiën','Beheer']) expect(screen.getByText(name)).toBeTruthy();
 const current=screen.getAllByRole('link').filter(link=>link.getAttribute('aria-current')==='page');
 expect(current).toHaveLength(1); expect(current[0].textContent).toContain('Facturen');
});
test('client navigation includes own documents without administrative controls',()=>{
 path='/dashboard/mijn-contracten'; render(React.createElement(Sidebar,{profile:{...profile,role:'klant'}}));
 expect(screen.getByRole('link',{name:'Mijn facturen'})).toBeTruthy();
 expect(screen.getByRole('link',{name:/Mijn contracten/}).getAttribute('aria-current')).toBe('page');
 expect(screen.queryByRole('link',{name:'Gebruikers'})).toBeNull();
});

test('mobile dialog cycles Tab at both boundaries and ignores unavailable controls',()=>{
 HTMLDialogElement.prototype.showModal=function(){this.open=true};
 HTMLDialogElement.prototype.close=function(){this.open=false};
 render(React.createElement(Sidebar,{profile}));
 fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
 const dialog=screen.getByRole('dialog',{name:'Portaalnavigatie'});
 const first=screen.getByRole('button',{name:'Sluit menu'});
 const last=[...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].at(-1);
 // jsdom has no layout: model only connected rendered controls as visible.
 for(const e of dialog.querySelectorAll('a,button')) e.getClientRects=()=>[{width:44,height:44}];
 const hidden=document.createElement('button');hidden.hidden=true;dialog.append(hidden);
 const disabled=document.createElement('button');disabled.disabled=true;dialog.append(disabled);
 last.focus(); fireEvent.keyDown(last,{key:'Tab'});expect(document.activeElement).toBe(first);
 first.focus();fireEvent.keyDown(first,{key:'Tab',shiftKey:true});expect(document.activeElement).toBe(last);
 dialog.focus();fireEvent.keyDown(dialog,{key:'Tab'});expect(document.activeElement).toBe(first);
});
