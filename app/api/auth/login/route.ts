import { NextResponse } from 'next/server';
import { loginSchema, verifyPassword, signJwt, setAuthCookie, checkRateLimit } from '@/lib/auth';
import { env } from '@/env.mjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check rate limit
    const identifier = `${request.headers.get('x-forwarded-for') || 'unknown'}_${email}`;
    if (checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Get user from KV
    const userJson = await env.USERS.get(`USER:${email}`);
    if (!userJson) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const session = { id: user.id, email: user.email, name: user.name };
    const token = await signJwt(session);
    await setAuthCookie(token);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 