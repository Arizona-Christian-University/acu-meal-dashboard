import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Check password against environment variable
    const correctPassword = process.env.DASHBOARD_PASSWORD || 'changeme';

    if (password === correctPassword) {
      const session = await getSession();
      session.isAuthenticated = true;
      session.loginTime = Date.now();
      await session.save();

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
