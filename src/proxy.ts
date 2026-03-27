import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Must be a **default export function** named `proxy` OR a named export `proxy`
// Turbopack requires a direct function export

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Matcher for which paths to run the proxy on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
