import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const runtime = 'edge';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    isAuthenticated: session.isAuthenticated === true,
  });
}
