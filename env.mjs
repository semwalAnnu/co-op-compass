import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  skipValidation: process.env.NODE_ENV === 'development',
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    // HMAC_SECRET: z.string().min(1), // Remove if not used anymore
    USERS: process.env.NODE_ENV === 'development' 
      ? z.any().optional()
      : z.any(), // Cloudflare KV binding, remove if Clerk handles users
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    // HMAC_SECRET: process.env.HMAC_SECRET,
    USERS: process.env.USERS,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
}); 