// iCal feed — RFC 5545 compliant
// URL: /api/calendar/feed?token=CALENDAR_TOKEN
// Admin token → all appointments; user token → own appointments only
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CRLF = '\r\n';

function foldLine(line: string): string {
  // RFC 5545: lines > 75 octets must be folded
  const max = 75;
  if (line.length <= max) return line;
  let result = '';
  let offset = 0;
  while (offset < line.length) {
    if (offset === 0) {
      result += line.slice(0, max);
      offset = max;
    } else {
      result += CRLF + ' ' + line.slice(offset, offset + max - 1);
      offset += max - 1;
    }
  }
  return result;
}

function formatDT(iso: string): string {
  // Convert ISO to UTC format: 20260410T090000Z
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('+00:00', 'Z');
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

const STATUS_MAP: Record<string, string> = {
  pending:   'TENTATIVE',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
  completed: 'CONFIRMED',
  no_show:   'CANCELLED',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  const supabase = await createClient();

  // Find user by calendar_token
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('calendar_token', token)
    .maybeSingle();

  if (!profile) {
    return new NextResponse('Invalid token', { status: 401 });
  }

  const isAdmin = profile.role === 'admin';

  let query = supabase
    .from('appointments')
    .select('*, profile:profiles(full_name, email)')
    .neq('status', 'cancelled')
    .order('starts_at');

  if (!isAdmin) query = query.eq('user_id', profile.id);

  const { data: appointments, error } = await query;
  if (error) {
    return new NextResponse('Internal error', { status: 500 });
  }

  const now = formatDT(new Date().toISOString());
  const calName = isAdmin ? 'Intrict – Alle afspraken' : 'Intrict – Mijn afspraken';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Intrict//Dashboard//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:Europe/Brussels',
    'X-WR-CALDESC:Afspraken via het Intrict klantenportaal',
  ];

  for (const appt of appointments ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = appt as any;
    const summary = isAdmin
      ? `${a.profile?.full_name ?? a.profile?.email ?? 'Klant'} – ${a.type_name}`
      : a.type_name;

    const descParts: string[] = [];
    if (a.notes)        descParts.push(`Bericht: ${a.notes}`);
    if (a.meeting_link) descParts.push(`Link: ${a.meeting_link}`);
    if (a.location)     descParts.push(`Locatie: ${a.location}`);
    const description = descParts.join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:appt-${a.id}@intrict.com`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${formatDT(a.starts_at)}`);
    lines.push(`DTEND:${formatDT(a.ends_at)}`);
    lines.push(foldLine(`SUMMARY:${escapeText(summary)}`));
    if (description) lines.push(foldLine(`DESCRIPTION:${description}`));
    if (a.meeting_link) lines.push(foldLine(`URL:${a.meeting_link}`));
    if (a.location) lines.push(foldLine(`LOCATION:${escapeText(a.location)}`));
    lines.push(`STATUS:${STATUS_MAP[a.status] ?? 'TENTATIVE'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const body = lines.join(CRLF) + CRLF;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="intrict-afspraken.ics"`,
      'Cache-Control': 'no-cache, no-store',
    },
  });
}
