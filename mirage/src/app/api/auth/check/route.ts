import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { timingSafeCompare } from '@/lib/security';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const clientCode = cookieStore.get('mirage_code')?.value;
    const serverCode = process.env.MIRAGE_ACCESS_CODE;

    if (!serverCode) {
      return NextResponse.json({ valid: true });
    }

    if (clientCode && timingSafeCompare(clientCode, serverCode)) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false }, { status: 401 });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
