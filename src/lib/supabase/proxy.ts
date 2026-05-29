import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPage = path === '/login' || path === '/register';
  const isDashboard = path.startsWith('/dashboard');

  // Skip auth check for public routes — avoids an unnecessary Supabase round-trip
  // on every request, which would block crawlers like GPTBot on 500s if it times out.
  if (!isDashboard && !isAuthPage) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: '.intrict.com',
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Correct destructuring — zonder dit is user altijd truthy
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    // Als er een ?next= parameter is naar tools.intrict.com, respecteer die
    const next = request.nextUrl.searchParams.get('next');
    if (next) {
      try {
        const parsed = new URL(next);
        if (parsed.origin === 'https://tools.intrict.com') {
          return NextResponse.redirect(next);
        }
      } catch { /* ongeldige URL — val door naar standaard redirect */ }
    }
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}