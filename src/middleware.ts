// import { auth } from "@clerk/nextjs";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/chat(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

// export default authMiddleware({
//   publicRoutes: ["/", "/api/webhook"],
// });

// export default authMiddleware({
//   publicRoutes: ["/", "/api/webhook"],
// });

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
