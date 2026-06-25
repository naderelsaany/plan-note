import { NextResponse } from 'next/server';

export function middleware(request) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/canvas', '/note'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // إذا كان المسار محمي ولا يوجد كوكيز للمصادقة، يتم طرده للرئيسية فوراً
  if (isProtectedRoute && !authCookie?.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // إذا كان المستخدم مصادقاً ويحاول الدخول للرئيسية (تسجيل الدخول)، نوجهه للوحة
  if (pathname === '/' && authCookie?.value === 'true') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon-512x512.png|logo.png).*)'],
};
