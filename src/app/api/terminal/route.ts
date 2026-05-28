import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_NAME    = 50;
const MAX_MESSAGE = 280;
const MAX_ROWS    = 20;

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type');
  const sb   = createAdminClient();

  if (type === 'broadcasts') {
    const { data, error } = await sb
      .from('terminal_logs')
      .select('soldier_name, message, created_at')
      .eq('type', 'broadcast')
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  }

  if (type === 'leaderboard') {
    const { data, error } = await sb
      .from('terminal_logs')
      .select('soldier_name, created_at')
      .eq('type', 'recruit')
      .order('created_at', { ascending: true })
      .limit(MAX_ROWS);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // deduplicate: keep first entry per name
    const seen = new Set<string>();
    const unique = (data ?? []).filter(r => {
      if (seen.has(r.soldier_name)) return false;
      seen.add(r.soldier_name);
      return true;
    });
    return NextResponse.json({ data: unique });
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, soldier_name, message, command } = body;

  if (!['recruit', 'broadcast', 'command'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  if (soldier_name && soldier_name.length > MAX_NAME) {
    return NextResponse.json({ error: 'Name too long' }, { status: 400 });
  }
  if (message && message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }

  const sb = createAdminClient();
  const { error } = await sb
    .from('terminal_logs')
    .insert({ type: action, soldier_name: soldier_name ?? null, message: message ?? null, command: command ?? null });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
