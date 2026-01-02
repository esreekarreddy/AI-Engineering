import { NextResponse } from 'next/server';
import { timingSafeCompare } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const serverCode = process.env.MIRAGE_ACCESS_CODE;

    if (!serverCode) {
      // No code configured = always valid
      return NextResponse.json({ success: true });
    }

    if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    if (timingSafeCompare(code, serverCode)) {
      const response = NextResponse.json({ success: true });
      
      // Set HttpOnly cookie
      response.cookies.set('mirage_code', code, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    }

    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
