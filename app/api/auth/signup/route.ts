import { NextResponse } from 'next/server';
import { createUser, signJwt, setAuthCookie } from '@/lib/auth';
import { env } from '@/env.mjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if user already exists
    const existingUser = await env.USERS.get(`USER:${body.email}`);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await createUser(body);
    
    // Store in KV
    await env.USERS.put(`USER:${user.email}`, JSON.stringify(user));

    // Create session
    const session = { id: user.id, email: user.email, name: user.name };
    const token = await signJwt(session);
    await setAuthCookie(token);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 400 }
    );
  }
} 