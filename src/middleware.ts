import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const MAX_COOKIE_SIZE = 4000;

export async function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader.length > MAX_COOKIE_SIZE) {
    const url = request.nextUrl.clone();
    if (url.pathname === '/clear-session.html') {
      return NextResponse.next();
    }
    url.pathname = '/clear-session.html';
    const response = NextResponse.redirect(url);
    request.cookies.getAll().forEach(({ name }) => {
      response.cookies.set(name, '', { maxAge: 0, path: '/' });
    });
    return response;
  }

  // Clean up stale Supabase auth cookies
  const allCookies = request.cookies.getAll();
  const sbCookies = allCookies.filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));
  if (sbCookies.length > 4) {
    const url = request.nextUrl.clone();
    url.pathname = '/clear-session.html';
    const response = NextResponse.redirect(url);
    allCookies.forEach(({ name }) => {
      response.cookies.set(name, '', { maxAge: 0, path: '/' });
    });
    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|clear-session\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)',
  ],
};
