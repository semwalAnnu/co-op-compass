import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { type User, type UserSession, type CreateUserInput, type LoginInput } from '@/types/User';

const HMAC_SECRET = new TextEncoder().encode(process.env.HMAC_SECRET!);

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9])/, 
    'Password must contain at least 1 uppercase letter and 1 number')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJwt(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(HMAC_SECRET);
}

export async function verifyJwt(token: string): Promise<UserSession> {
  const { payload } = await jwtVerify(token, HMAC_SECRET);
  const { id, email, name } = payload as { id: string; email: string; name: string };
  return { id, email, name };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth');
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth')?.value;
}

// Rate limiting helper
const rateLimits = new Map<string, { count: number, timestamp: number }>();

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);

  if (!limit) {
    rateLimits.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  if (now - limit.timestamp > 15 * 60 * 1000) { // 15 minutes
    rateLimits.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  if (limit.count >= 5) { // 5 attempts per 15 minutes
    return true;
  }

  limit.count += 1;
  return false;
}

export function generateUserId(): string {
  return `usr_${crypto.randomUUID()}`;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { email, name, password } = userSchema.parse(input);
  
  const user: User = {
    id: generateUserId(),
    email,
    name,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };

  return user;
}

export function sanitizeUser(user: User): UserSession {
  const { id, email, name } = user;
  return { id, email, name };
} 