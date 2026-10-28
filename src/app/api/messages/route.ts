import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hydrateMessageProfiles } from '@/lib/message-profiles';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && ![400, 401, 403].includes(authError.status ?? 0)) throw authError;

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get('limit') ?? '50';
    const rawOffset = searchParams.get('offset') ?? '0';
    if (!/^\d+$/.test(rawLimit) || !/^\d+$/.test(rawOffset) ||
        !Number.isSafeInteger(Number(rawLimit)) || !Number.isSafeInteger(Number(rawOffset)) ||
        Number(rawLimit) < 1 || Number(rawOffset) > Number.MAX_SAFE_INTEGER - 100) {
      return NextResponse.json({ error: 'Ongeldige paginering.' }, { status: 400 });
    }
    const limit = Math.min(Number(rawLimit), 100);
    const offset = Number(rawOffset);

    // Get conversations where the user is a participant with pagination
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        subject,
        created_at,
        updated_at,
        created_by,
        conversation_participants!inner(profile_id),
        messages(
          id,
          content,
          created_at,
          read_at,
          sender_id
        )
      `)
      .eq('conversation_participants.profile_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Gesprekken konden niet worden geladen.' }, { status: 500 });
    }

    // Process the data to get the last message and unread count for each conversation
    const processedConversations = await Promise.all((conversations ?? []).map(async conv => {
      const messages = await hydrateMessageProfiles(supabase, conv.id, conv.messages || []);
      const lastMessage = messages.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const unreadCount = messages.filter(msg =>
        msg.sender_id !== user.id && !msg.read_at
      ).length;

      return {
        id: conv.id,
        subject: conv.subject,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        created_by: conv.created_by,
        last_message: lastMessage ? {
          content: lastMessage.content,
          created_at: lastMessage.created_at,
          sender: lastMessage.profiles
        } : null,
        unread_count: unreadCount
      };
    }));

    return NextResponse.json(
      { conversations: processedConversations },
      {
        headers: {
          // Private: only cached in the browser, not shared proxies
          // stale-while-revalidate: serve stale for 30s while revalidating in background
          'Cache-Control': 'private, max-age=0, stale-while-revalidate=30',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Gesprekken konden niet worden geladen.' }, { status: 500 });
  }
}