import { auth } from '@/lib/auth';

/**
 * Middleware to protect routes
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/workspace') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'));

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/workspace', req.nextUrl));
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
