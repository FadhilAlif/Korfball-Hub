import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected path prefixes
const PROTECTED_PATHS = [
  '/dashboard',
  '/athletes',
  '/team',
  '/training',
  '/attendance',
  '/matches',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('korfball_auth_token')?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // If user is accessing root /
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is accessing protected routes without token
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and visits /login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
