import 'server-only';
import { verify } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public verification key only. Private signing key stays with the collector.
// Contract: Ed25519 signature over UTF-8 `GET\nhttps://www.intrict.com\n`
// + exact pathname/query + `\n` + decimal Unix seconds, without a trailing newline.
// Send X-Intrict-Monitor-Timestamp and X-Intrict-Monitor-Signature (base64).
// A signed read may replay within the 60-second clock-skew window; it has no writes.
// Rotation/revocation: replace this PUBLIC key (or remove the route) through a
// reviewed GitHub release, verify production rejects the old key, then switch
// the collector to the matching new private key. Never commit private keys.
// Revocation is not immediate until that release is actually deployed.
// Full reconciliation: begin each source without `after`, follow next_cursor
// until complete=true. This is not a cross-page transactional snapshot: inserts
// below a consumed UUID or concurrent status edits require the next full sweep.
// Never persist the final UUID as a temporal watermark or infer read state writes.
// Existing Supabase URL/service-role config and a unique exact-email admin owner
// are prerequisites; missing config/schema/owner yields 503, never empty success.
const publicKey = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA86D/0laGkpp4sdUWSf4Q138LmGcspdI/zhx92EJo9FE=
-----END PUBLIC KEY-----`;
const origin = 'https://www.intrict.com';
const path = '/api/monitor/requests';
function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
function authenticated(request: Request) {
  const url = new URL(request.url);
  const timestamp = request.headers.get('x-intrict-monitor-timestamp') ?? '';
  const signature = request.headers.get('x-intrict-monitor-signature') ?? '';
  if (request.method !== 'GET' || url.origin !== origin || url.pathname !== path ||
      !/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 ||
      !/^[A-Za-z0-9+/]{86}==$/.test(signature)) return false;
  return verify(null, Buffer.from(`GET\n${origin}\n${path}${url.search}\n${timestamp}`), publicKey, Buffer.from(signature, 'base64'));
}

export async function GET(request: Request) {
  if (!authenticated(request)) return reply({ error: 'Unauthorized' }, 401);
  const params = new URL(request.url).searchParams;
  const source = params.get('source');
  const after = params.get('after');
  const limit = params.get('limit') ?? '100';
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if ([...params.keys()].some(key => !['source', 'after', 'limit'].includes(key) || params.getAll(key).length !== 1) ||
      !source || !['package_requests', 'appointments', 'messages'].includes(source) ||
      (after !== null && !uuid.test(after)) || !/^[1-9]\d{0,2}$/.test(limit) || Number(limit) > 500) {
    return reply({ error: 'Invalid parameters' }, 400);
  }
  try {
    const admin = createAdminClient();
    const { data: owner, error: ownerError } = await admin.from('profiles')
      .select('id,role').eq('email', 'jonas@intrict.com').single();
    if (ownerError || !owner || owner.role !== 'admin' || !uuid.test(owner.id)) {
      return reply({ error: 'Monitor unavailable' }, 503);
    }
    const fields = source === 'messages'
      ? ['id', 'conversation_id', 'created_at', 'read_at']
      : source === 'appointments'
        ? ['id', 'status', 'created_at', 'updated_at', 'starts_at', 'ends_at']
        : ['id', 'status', 'created_at', 'updated_at'];
    const selection = fields.join(',') + (source === 'messages'
      ? ',conversations!inner(conversation_participants!inner(profile_id))' : '');
    let query = admin.from(source).select(selection, { count: 'exact' })
      .order('id', { ascending: true }).limit(Number(limit));
    if (source === 'messages') {
      query = query.eq('conversations.conversation_participants.profile_id', owner.id)
        .neq('sender_id', owner.id);
    }
    if (after) query = query.gt('id', after);
    const { data, error, count } = await query;
    if (error || !Array.isArray(data) || !Number.isSafeInteger(count) || count === null || count < data.length ||
        data.length > Number(limit) || (data.length === 0 && count !== 0)) {
      return reply({ error: 'Monitor unavailable' }, 503);
    }
    const timestamp = z.iso.datetime({ offset: true });
    const identifier = z.string().regex(uuid);
    const schema = source === 'messages'
      ? z.object({ id: identifier, conversation_id: identifier, created_at: timestamp, read_at: timestamp.nullable() })
      : source === 'appointments'
        ? z.object({ id: identifier, status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']), created_at: timestamp, updated_at: timestamp, starts_at: timestamp, ends_at: timestamp })
        : z.object({ id: identifier, status: z.enum(['pending', 'contacted', 'accepted', 'rejected']), created_at: timestamp, updated_at: timestamp });
    const records = z.array(schema).parse(data);
    let previous = after?.toLowerCase() ?? '';
    for (const record of records) {
      if (record.id.toLowerCase() <= previous) return reply({ error: 'Monitor unavailable' }, 503);
      previous = record.id.toLowerCase();
    }
    const complete = count === records.length;
    return reply({ source, records, next_cursor: complete ? null : records.at(-1)?.id, complete });
  } catch {
    return reply({ error: 'Monitor unavailable' }, 503);
  }
}
