import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashPassword, verifyPassword, signJwt, verifyJwt, createUser } from '@/lib/auth';

vi.mock('@/env.mjs', () => ({
  env: {
    USERS: {
      get: vi.fn(),
      put: vi.fn(),
    },
  },
}));

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPass123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should verify password correctly', async () => {
      const password = 'TestPass123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPass123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPass123', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Handling', () => {
    const testUser = {
      id: 'test123',
      email: 'test@example.com',
      name: 'Test User'
    };

    it('should sign and verify JWT', async () => {
      const token = await signJwt(testUser);
      expect(token).toBeTruthy();
      
      const verified = await verifyJwt(token);
      expect(verified).toMatchObject(testUser);
    });

    it('should reject invalid JWT', async () => {
      await expect(verifyJwt('invalid.token.here')).rejects.toThrow();
    });
  });

  describe('User Creation', () => {
    const validInput = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'TestPass123'
    };

    it('should create user with valid input', async () => {
      const user = await createUser(validInput);
      expect(user).toMatchObject({
        email: validInput.email,
        name: validInput.name
      });
      expect(user.id).toMatch(/^usr_/);
      expect(user.passwordHash).toBeTruthy();
      expect(user.createdAt).toBeTruthy();
    });

    it('should reject invalid email', async () => {
      await expect(createUser({
        ...validInput,
        email: 'invalid-email'
      })).rejects.toThrow();
    });

    it('should reject weak password', async () => {
      await expect(createUser({
        ...validInput,
        password: 'weak'
      })).rejects.toThrow();
    });
  });
}); 