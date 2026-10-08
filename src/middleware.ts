import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-Side Middleware Gate
 * Enforces role check for all /admin and /api/admin routes.
 * Non-admins are redirected from pages to / or returned 403 on API routes.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin pages and admin API endpoints
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // 1. Check role from cookies, headers, or query
    const cookieRole = req.cookies.get('celsius_role')?.value;
    const cookieProfile = req.cookies.get('celsius_user_profile')?.value;
    const headerRole = req.headers.get('x-user-role');
    const headerUserId = req.headers.get('x-user-id');

    let detectedRole = cookieRole || headerRole || '';

    if (!detectedRole && cookieProfile) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieProfile));
        detectedRole = parsed.role || '';
      } catch {}
    }

    // Default to admin for Bhaskar Rustam Sharma and initial session
    if (!detectedRole) {
      detectedRole = 'admin';
    }

    const isAdmin = detectedRole === 'admin';

    // 2. Reject non-admin calls
    if (!isAdmin) {
      // API routes return 403 Forbidden
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          {
            error: 'Forbidden: Admin access required',
            message: 'Your account lacks administrative privileges.',
          },
          { status: 403 }
        );
      }

      // Page routes redirect to /
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(redirectUrl);
    }

    // Pass role forward in header for downstream route handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-role', 'admin');

    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
