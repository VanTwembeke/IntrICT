import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
    const input = body as Record<string, unknown>;
    const { recipientId, subject, message } = input;
    if (Object.keys(input).some(key => !['recipientId', 'subject', 'message'].includes(key)) ||
        typeof recipientId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipientId) ||
        typeof message !== 'string' || !message.trim() || message.length > 20000 ||
        (subject !== undefined && (typeof subject !== 'string' || subject.length > 200))) {
      return NextResponse.json({ error: 'Ongeldige invoer.' }, { status: 400 });
    }
    const { data, error } = await supabase.rpc('start_support_conversation', {
      recipient_uuid: recipientId, subject_text: subject ?? '', message_text: message,
    });
    if (error) return NextResponse.json({ error: error.code === '42501' ? 'Ontvanger niet toegestaan.' : 'Gesprek kon niet worden gestart.' }, { status: error.code === '42501' ? 403 : error.code === '22023' ? 400 : 503 });
    if (!data?.conversationId || !data?.message?.id) return NextResponse.json({ error: 'Gesprek kon niet worden bevestigd.' }, { status: 503 });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
