import { NextResponse } from 'next/server';
import { COOKIE_SESSION } from '../../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const rep = NextResponse.json({ ok: true });
  rep.cookies.set(COOKIE_SESSION, '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return rep;
}
