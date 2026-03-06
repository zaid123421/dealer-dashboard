import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // جلب التوكن من الكوكيز
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. إذا حاول الدخول لصفحات المحمية (Dashboard) وهو مو مسجل دخول
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. إذا كان مسجل دخول وحاول يرجع لصفحة الـ Login
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// تحديد المسارات التي يراقبها الميدل وير
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};