import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';
import { canAccess } from '@/shared/config/permissions';
import { parseRole } from '@/shared/config/roles';

const USER_ROLE_COOKIE = 'user-role';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('refresh-token')?.value;
  const roleCookie = request.cookies.get(USER_ROLE_COOKIE)?.value;
  const role = parseRole(roleCookie);
  const { pathname } = request.nextUrl;

  const loginPath = ROUTES.AUTH.LOGIN;
  const dashboardPath = ROUTES.DASHBOARD.ROOT;
  const forbiddenPath = ROUTES.ERRORS.FORBIDDEN;

  if (!token && pathname.startsWith(dashboardPath)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  const registerPath = ROUTES.AUTH.REGISTER;
  if (
    token &&
    (pathname === loginPath || pathname === registerPath)
  ) {
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  if (token && pathname.startsWith(dashboardPath)) {
    if (!role || !canAccess(role, pathname)) {
      return NextResponse.redirect(new URL(forbiddenPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};