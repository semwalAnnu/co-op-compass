import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // publicRoutes: ['/', '/api/extract(.*)'], // Add any routes here that should be accessible to unauthenticated users
  // ignoredRoutes: ['/some/webhook/route'] // Add any routes here that Clerk should completely ignore
});

export const config = {
  matcher: [
    // Ensure Clerk runs on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/', 
  ],
};