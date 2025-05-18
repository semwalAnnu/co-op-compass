import { NextResponse } from 'next/server';
import { createUser, signJwt, setAuthCookie, userSchema, generateUserId } from '@/lib/auth';
import storage from '@/lib/storage';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Signup request body:', { ...body, password: '[REDACTED]' });
    
    // Validate input first
    try {
      userSchema.parse(body);
    } catch (validationError) {
      console.log('Validation error:', validationError);
      if (validationError instanceof ZodError) {
        const errors = validationError.errors.map(err => {
          console.log('Validation error details:', err);
          if (err.code === 'invalid_string' && err.validation === 'regex') {
            return 'Password must contain at least 1 uppercase letter and 1 number';
          }
          if (err.code === 'invalid_string' && err.validation === 'email') {
            return 'Please enter a valid email address';
          }
          if (err.code === 'too_small' && err.path[0] === 'name') {
            return 'Name must be at least 2 characters long';
          }
          if (err.code === 'too_small' && err.path[0] === 'password') {
            return 'Password must be at least 8 characters long';
          }
          return err.message;
        });
        return NextResponse.json(
          { error: errors[0] },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const userKey = `user:${body.email}`;
    const existingUser = await storage.get(userKey);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Generate user ID and create new user
    const userId = generateUserId();
    const user = await createUser({
      id: userId,
      email: body.email,
      password: body.password,
      name: body.name
    });
    
    // Store in storage
    await storage.put(userKey, JSON.stringify(user));

    // Create session
    const session = { id: user.id, email: user.email, name: user.name };
    const token = await signJwt(session);
    await setAuthCookie(token);

    return NextResponse.json(session);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}