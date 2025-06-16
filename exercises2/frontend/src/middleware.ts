import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が不要なパスのリスト
const publicPaths = ['/login'];

// 認証が必要なパスのリスト
const protectedPaths = ['/', '/users', '/roles', '/troubles'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('idToken')?.value;
  const { pathname } = request.nextUrl;

  // パブリックパスの場合
  if (publicPaths.includes(pathname)) {
    // ログイン済みの場合はダッシュボードにリダイレクト
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 保護されたパスの場合
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    // トークンがない場合はログインページにリダイレクト
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを設定
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