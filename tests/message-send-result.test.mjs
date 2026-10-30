import assert from 'node:assert/strict';
import {test,expect} from 'vitest';
import {readMessageSendResult as read} from '../src/lib/message-send-result';
const id='20000000-0000-4000-8000-000000000001';
const response=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
const tests=[
 ['legacy deployed success',async()=>{assert.deepEqual(await read(response(200,{message:'Message sent successfully',messageId:id})),{created:true,retrySafe:false,notice:''})}],
 ['new partial success',async()=>{const r=await read(response(201,{messageCreated:true,messageId:id,failedAttachmentCount:2}));assert.equal(r.created,true);assert.equal(r.retrySafe,false);assert.match(r.notice,/2/)}],
 ['new unknown attachment success',async()=>{const r=await read(response(201,{messageCreated:true,messageId:id,attachmentOutcomeUnknown:true}));assert.equal(r.created,true);assert.equal(r.retrySafe,false);assert.match(r.notice,/onbekend/)}],
 ['missing successful body fields',async()=>{const r=await read(response(200,{}));assert.equal(r.created,false);assert.equal(r.retrySafe,false);assert.match(r.notice,/onbekend/)}],
 ['incomplete successful legacy shape',async()=>{assert.equal((await read(response(200,{message:'Message sent successfully'}))).retrySafe,false)}],
 ['malformed truthy created',async()=>{const r=await read(response(200,{messageCreated:'true',messageId:id}));assert.equal(r.created,false);assert.equal(r.retrySafe,false)}],
 ['malformed message id',async()=>{const r=await read(response(200,{messageCreated:true,messageId:42}));assert.equal(r.created,false);assert.equal(r.retrySafe,false)}],
 ['unrecognized successful message',async()=>{assert.equal((await read(response(200,{message:'something else',messageId:id}))).retrySafe,false)}],
 ['null body',async()=>{assert.equal((await read(response(200,null))).retrySafe,false)}],
 ['array body',async()=>{assert.equal((await read(response(200,[]))).retrySafe,false)}],
 ['JSON/body transport failure',async()=>{assert.equal((await read({ok:true,status:200,json:async()=>{throw new Error('lost')}})).retrySafe,false)}],
 ['non-JSON error',async()=>{assert.equal((await read({ok:false,status:502,json:async()=>{throw new SyntaxError('html')}})).retrySafe,false)}],
 ['explicit unknown failure',async()=>{assert.equal((await read(response(503,{outcomeUnknown:true,error:'refresh'}))).retrySafe,false)}],
 ['unclassified server failure',async()=>{assert.equal((await read(response(500,{error:'Bad gateway'}))).retrySafe,false)}],
 ['explicit preinsert provider failure',async()=>{assert.equal((await read(response(503,{outcomeUnknown:false,error:'before insertion'}))).retrySafe,true)}],
 ['known validation failure',async()=>{assert.equal((await read(response(400,{error:'Invalid file'}))).retrySafe,true)}],
 ['validation failure marked uncertain',async()=>{assert.equal((await read(response(400,{error:'Invalid',outcomeUnknown:true}))).retrySafe,false)}],
 ['validation status without contract',async()=>{assert.equal((await read(response(400,{}))).retrySafe,false)}],
 ['missing HTTP status on unknown failure',async()=>{assert.equal((await read({ok:false,json:async()=>({error:'unknown'})})).retrySafe,false)}],
 ['HTTP failure cannot create success',async()=>{const r=await read(response(503,{messageCreated:true,messageId:id}));assert.equal(r.created,false);assert.equal(r.retrySafe,false)}],
 ['contradictory created and retry-safe failure',async()=>{const r=await read(response(503,{messageCreated:true,messageId:id,error:'failed',outcomeUnknown:false}));assert.equal(r.created,false);assert.equal(r.retrySafe,false)}],
 ['rejection with message identity is uncertain',async()=>{assert.equal((await read(response(400,{messageId:id,error:'failed'}))).retrySafe,false)}],
];
for(const [name,run] of tests)test(name,run);
for(const id of ['', 'm', '00000000-0000-0000-0000-000000000000', '20000000-0000-4000-7000-000000000001'])test(`invalid identity ${id}`,async()=>{expect(await read(response(200,{messageCreated:true,messageId:id}))).toMatchObject({created:false,retrySafe:false})});
for(const status of [400,401,403,404,413,415])test(`known preinsert status ${status}`,async()=>{expect(await read(response(status,{error:'Rejected'}))).toMatchObject({created:false,retrySafe:true})});
