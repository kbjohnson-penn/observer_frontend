import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken");

  // Redirect to login if access token is missing
  if (!accessToken) {
    const protectedRoutes = ["/dashboard", "/profile"];
    if (
      protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
      )
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Protect multiple routes using matcher
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all sub-paths under /dashboard
    "/profile/:path*", // Protect /profile and its sub-paths
  ],
};
