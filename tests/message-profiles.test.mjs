import { describe, it, expect, vi } from 'vitest';
import { hydrateMessageProfiles } from '../src/lib/message-profiles';

describe('conversation-bound profile hydration', () => {
 it('restores sender and parent identities from authorized peers without base profile reads', async () => {
  const rpc = vi.fn().mockResolvedValue({data:[{id:'admin',full_name:'Support',email:'support@example.invalid'}],error:null});
  const rows = await hydrateMessageProfiles({rpc},'conversation', [{id:'m',sender_id:'admin',parent_message:{id:'p',sender_id:'admin'}}]);
  expect(rpc).toHaveBeenCalledWith('conversation_peers',{conversation_uuid:'conversation'});
  expect(rows[0].profiles.full_name).toBe('Support');
  expect(rows[0].parent_message?.profiles.full_name).toBe('Support');
 });
 it('normalizes PostgREST inferred array parents to the UI object contract', async () => {
  const rows=await hydrateMessageProfiles({rpc:vi.fn().mockResolvedValue({data:[{id:'a',full_name:'A',email:'a@example.invalid'}],error:null})},'v',[{sender_id:'a',parent_message:[{sender_id:'a',content:'reply'}]}]);
  expect(rows[0].parent_message.profiles.full_name).toBe('A');
  expect(rows[0].parent_message.content).toBe('reply');
 });
 it('propagates directory outages rather than rendering success/empty', async () => {
  await expect(hydrateMessageProfiles({rpc:vi.fn().mockResolvedValue({data:null,error:{message:'unavailable'}})},'v',[])).rejects.toThrow();
 });
 it('uses a nonprivate fallback for a former participant, not a wider directory', async () => {
  const rows=await hydrateMessageProfiles({rpc:vi.fn().mockResolvedValue({data:[],error:null})},'v',[{sender_id:'former'}]);
  expect(rows[0].profiles).toEqual({full_name:'Voormalige deelnemer',email:''});
 });
});
