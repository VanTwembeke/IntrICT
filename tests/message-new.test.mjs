import { describe, it, expect, vi, beforeEach } from 'vitest';
const {client}=vi.hoisted(()=>({client:{auth:{getUser:vi.fn()},rpc:vi.fn()}}));
vi.mock('@/lib/supabase/server',()=>({createClient:vi.fn(async()=>client)}));
import { POST } from '../src/app/api/messages/new/route';
const recipientId='00000000-0000-0000-0000-000000000003';
const request=(body, origin)=>new Request('https://intrict.example/api/messages/new',{method:'POST',headers:{'content-type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();client.auth.getUser.mockResolvedValue({data:{user:{id:'caller'}},error:null});client.rpc.mockResolvedValue({data:{conversationId:'c',message:{id:'m'}},error:null});});
describe('atomic caller-bound support creation',()=>{
 it('uses only caller-session atomic RPC and preserves response shape',async()=>{
  const r=await POST(request({recipientId,message:'hello'}));expect(r.status).toBe(200);
  expect(client.rpc).toHaveBeenCalledWith('start_support_conversation',{recipient_uuid:recipientId,subject_text:'',message_text:'hello'});
  expect(await r.json()).toEqual({conversationId:'c',message:{id:'m'}});
 });
 it('rejects caller forgery before RPC',async()=>{expect((await POST(request({recipientId,message:'x',created_by:'victim'}))).status).toBe(400);expect(client.rpc).not.toHaveBeenCalled();});
 it('rejects cross-origin mutation',async()=>{expect((await POST(request({recipientId,message:'x'},'https://foreign.example'))).status).toBe(403);expect(client.rpc).not.toHaveBeenCalled();});
 it('maps unauthorized recipient to denial',async()=>{client.rpc.mockResolvedValue({data:null,error:{code:'42501'}});expect((await POST(request({recipientId,message:'x'}))).status).toBe(403);});
 it('keeps provider failure distinct from success',async()=>{client.rpc.mockResolvedValue({data:null,error:{code:'XX000'}});expect((await POST(request({recipientId,message:'x'}))).status).toBe(503);});
 it('rejects empty message',async()=>{expect((await POST(request({recipientId,message:'  '}))).status).toBe(400);});
 it('rejects guest',async()=>{client.auth.getUser.mockResolvedValue({data:{user:null},error:null});expect((await POST(request({recipientId,message:'x'}))).status).toBe(401);});
});
