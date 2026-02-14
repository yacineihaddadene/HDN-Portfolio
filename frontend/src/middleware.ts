import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check if user has a session cookie
    // In production with secure: true, Better Auth prefixes cookie names with __Secure-
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token');
    
    if (!sessionCookie || !sessionCookie.value) {
      // Redirect to unauthorized page if no session
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
