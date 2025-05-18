import { NextResponse } from 'next/server';
import { verifyPassword, signJwt, setAuthCookie, loginSchema, checkRateLimit } from '@/lib/auth';
import storage from '@/lib/storage';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    try {
      loginSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid email or password format' },
          { status: 400 }
        );
      }
    }

    const { email, password } = body;
    
    // Check rate limiting
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ratelimit:login:${ipAddress}`;
    if (checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Get user from storage
    const userKey = `user:${email}`;
    const userJson = await storage.get(userKey);
    
    if (!userJson) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userJson);

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
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
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 