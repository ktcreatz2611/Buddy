import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protected routes that require authentication.
 * These correspond to the (workspace) route group pages.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/chat',
  '/compare',
  '/documents',
  '/research',
  '/tools',
  '/memories',
  '/settings',
];

/**
 * Edge-compatible middleware — checks session cookie presence.
 * Full session validation happens in API routes via auth().
 */
export function middleware(req: NextRequest) {
  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value;

  const isLoggedIn = !!sessionToken;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedPage = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/');

  // Redirect unauthenticated users away from protected routes
  if ((isProtectedPage || isProtectedApi) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
