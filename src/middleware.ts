import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/admin',
];

// Define auth routes that should redirect if already authenticated
const authRoutes = [
  '/login',
  '/auth/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has auth cookies
  const accessToken = request.cookies.get('__Secure-trl_at');
  const refreshToken = request.cookies.get('__Secure-trl_rt');
  const isAuthenticated = !!(accessToken || refreshToken);

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to home with a login prompt
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth_required', 'true');
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes (redirect if already authenticated)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect to home if already authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
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
