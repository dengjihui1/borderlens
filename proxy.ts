import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-borderlens-locale', request.nextUrl.pathname === '/en' || request.nextUrl.pathname.startsWith('/en/') ? 'en' : 'zh');
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/', '/policies/:path*', '/coverage/:path*', '/demo/:path*', '/en/:path*'] };
