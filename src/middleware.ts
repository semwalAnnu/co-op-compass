import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(
  (auth, req) => {
    // Keep users on our domain during auth flow
  },
  (req) => ({
    // Configure Clerk to use our domain and paths
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    // Use the current host as domain
    domain: req.headers.get('host') || 'localhost:3000'
  })
);

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/(api|trpc)(.*)"
  ]
};