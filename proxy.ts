import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-replace-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  let session = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ['HS256'],
      });
      session = payload;
    } catch (error) {
      // Invalid token
    }
  }

  const { pathname } = req.nextUrl;

  // Protect /upload: only admin and publisher
  if (pathname.startsWith('/upload')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (session.role !== 'admin' && session.role !== 'publisher') {
      return NextResponse.redirect(new URL('/', req.url)); // unauthorized
    }
  }

  // Protect /admin: only admin
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url)); // unauthorized
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/upload/:path*', '/admin/:path*'],
};
