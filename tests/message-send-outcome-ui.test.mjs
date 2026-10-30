import React from 'react';
import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import MessagesPage from '../src/app/dashboard/messages/MessagesPage';
import ChatWidget from '../src/components/dashboard/ChatWidget';
const {ctx}=vi.hoisted(()=>({ctx:{isOpen:true,activeConversationId:'conversation',conversations:[{id:'conversation',subject:'Bestaand gesprek'}],markAsRead:vi.fn(),refetchConversations:vi.fn(),unreadCount:0}}));
vi.mock('@/contexts/ChatContext',()=>({useChatContext:()=>ctx,invalidateConversationsCache:vi.fn()}));
vi.mock('framer-motion',()=>{
 const el=tag=>function Element({children,initial,animate,exit,transition,layout,whileHover,whileTap,...props}){void initial;void animate;void exit;void transition;void layout;void whileHover;void whileTap;return React.createElement(tag,props,children)};
 return {AnimatePresence:({children})=>children,motion:{div:el('div'),button:el('button')}};
});
const profile={id:'user',role:'user',full_name:'Synthetic User',email:'user@example.invalid'};
const conversation={id:'conversation',subject:'Bestaand gesprek',created_at:'2026-01-01',updated_at:'2026-01-01',created_by:'user',last_message:null,unread_count:0};
const id='cdb90146-5a0b-49f3-89bf-e538daa8d107';
const cases=[
 ['legacy success',200,{message:'Message sent successfully',messageId:id},false,''],
 ['partial success',200,{messageCreated:true,messageId:id,failedAttachmentCount:1},false,'1 bijlage(n)'],
 ['unknown success',200,{},false,'onbekend'],
 ['unknown server error',500,{error:'Unavailable'},false,'onbekend'],
 ['validation rejection',400,{error:'Missing required fields'},true,'Missing required fields'],
 ['contradictory failure',400,{error:'mixed',messageId:id,outcomeUnknown:false},false,'onbekend'],
 ['non-JSON',502,null,false,'onbekend'],
 ['transport rejection',0,null,false,'onbekend'],
];
beforeEach(()=>{Element.prototype.scrollIntoView=vi.fn()});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks()});
for(const widget of [false,true])for(const [name,status,body,retry,notice] of cases)test(`${widget?'widget':'page'} ${name} never replays an uncertain committed send`,async()=>{
 let sent=false;
 const fetch=vi.fn(async(url)=>{
  if(url==='/api/messages/send') {sent=true;if(!status)throw Error('connection lost');return {ok:status===200,status,json:async()=>{if(body===null)throw Error('invalid JSON');return body}};}
  return {ok:true,json:async()=>url==='/api/messages'?{conversations:[conversation]}:{conversation:{...conversation,conversation_participants:[]},messages:sent&&!retry?[{id,content:'confirmed row',created_at:'2026-01-01',sender_id:'user',profiles:profile,message_attachments:[]}]:[]}};
 });
 vi.stubGlobal('fetch',fetch);
 if(widget)render(React.createElement(ChatWidget,{profile}));else{render(React.createElement(MessagesPage,{profile,allProfiles:[],initialConversations:[conversation]}));fireEvent.click(screen.getByRole('button',{name:/Bestaand gesprek/}))}
 const input=await screen.findByPlaceholderText(widget?'Bericht typen…':'Typ je bericht...');
 fireEvent.change(input,{target:{value:'do not duplicate customer text'}});
 fireEvent.keyDown(input,{key:'Enter',shiftKey:false});
 await waitFor(()=>expect(fetch.mock.calls.filter(([u])=>u==='/api/messages/send')).toHaveLength(1));
 if(notice)await waitFor(()=>expect(screen.getByRole('status').textContent).toContain(notice));
 else await waitFor(()=>expect(screen.getByText('confirmed row')).toBeTruthy());
 expect(input.value).toBe(retry?'do not duplicate customer text':'');
 expect(fetch.mock.calls.filter(([u])=>u==='/api/messages/send')).toHaveLength(1);
});
