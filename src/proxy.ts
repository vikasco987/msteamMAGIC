// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/api/tasks(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   // ✅ Just call auth().protect directly without awaiting or invoking auth()
//   if (isProtectedRoute(req)) {
//     auth().protect(); // ← do not `await` this, it's synchronous
//   }
// });

// export const config = {
//   matcher: [
//     "/((?!_next|.*\\..*).*)", // all routes except static files
//     "/(api|trpc)(.*)",        // all api/trpc routes
//   ],
// };









// // middleware.ts
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// // ✅ Create matchers
// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/team-board(.*)',
//   '/create-task(.*)',
//   '/api/tasks(.*)',
//   '/api/team-members(.*)',
// ])

// // ✅ Apply middleware
// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) {
//     await auth.protect() // ✅ NOT auth().protect() — this is the fix!
//   }
// })

// // ✅ Match API and all non-static routes
// export const config = {
//   matcher: [
//     '/((?!_next|.*\\..*).*)',
//     '/(api|trpc)(.*)',
//   ],
// }




// // middleware.ts

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// // ✅ Protected routes matcher
// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/team-board(.*)",
//   "/create-task(.*)",
//   "/report(.*)",
//   "/api/tasks(.*)",
//   "/api/team-members(.*)",
// ]);

// // ✅ Combined Clerk middleware with route protection and redirect
// export default clerkMiddleware(async (auth, req) => {
//   // Protect specific routes
//   if (isProtectedRoute(req)) {
//     await auth().protect();
//   }

//   // Redirect root path ("/") to /dashboard
//   const url = new URL(req.url);
//   if (url.pathname === "/") {
//     return Response.redirect(new URL("/dashboard", req.url));
//   }

//   // ✅ Optional: Redirect /sign-in or /sign-up to dashboard if already logged in
//   const session = auth();
//   if (
//     (url.pathname === "/sign-in" || url.pathname === "/sign-up") &&
//     session.userId
//   ) {
//     return Response.redirect(new URL("/dashboard", req.url));
//   }
// });

// // ✅ Apply to all app + API routes, excluding _next/static assets
// export const config = {
//   matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
// };








// // middleware.ts

// import { clerkMiddleware } from '@clerk/nextjs/server';
// import { createRouteMatcher } from '@clerk/nextjs/server';

// // ✅ Protected routes
// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/team-board(.*)',
//   '/create-task(.*)',
//   '/report(.*)',
//   '/api/tasks(.*)',
//   '/api/team-members(.*)',
// ]);

// // ✅ Proper Clerk middleware logic
// const middleware = clerkMiddleware((auth, req) => {
//   // ✅ Clerk automatically protects routes based on matcher
//   if (isProtectedRoute(req)) {
//     // No need to call anything; Clerk handles protection
//     // Just don't call protect(), requireUser(), or authenticate()
//   }

//   // ✅ Optional: Redirect root `/` to `/dashboard`
//   const url = new URL(req.url);
//   if (url.pathname === '/') {
//     return Response.redirect(new URL('/dashboard', req.url));
//   }

//   return null;
// });

// export default middleware;

// // ✅ Applies middleware to all app + API routes except static assets and _next
// export const config = {
//   matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
// };









// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";  //, createRouteMatcher
import { NextResponse } from "next/server";

// ✅ Define protected routes
// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/team-board(.*)",
//   "/create-task(.*)",
//   "/report(.*)",
//   "/api/tasks(.*)",
//   "/api/team-members(.*)",
// ]);

// ✅ Attach middleware logic
const middleware = clerkMiddleware((auth, req) => {
  // Optional: no need for auth().protect() here, Clerk auto-protects routes
  const url = new URL(req.url);

  // ✅ Redirect '/' to '/dashboard'
  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

// ✅ Export it properly
export default middleware;

// ✅ Apply to all routes except _next/static and files
export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // All pages
    "/(api|trpc)(.*)",        // API routes
  ],
};
