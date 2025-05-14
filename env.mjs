import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    HMAC_SECRET: z.string().min(1),
    USERS: z.any(), // Cloudflare KV binding
  },
  client: {},
  runtimeEnv: {
    HMAC_SECRET: process.env.HMAC_SECRET,
    USERS: process.env.USERS,
  },
}); 