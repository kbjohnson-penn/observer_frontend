import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  // Check if the current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for httpOnly access token cookie
    const token = request.cookies.get("access_token")?.value;

    // Check for both existence AND non-empty value
    if (!token || token.trim() === "") {
      // Redirect to login if no token or empty token found
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Valid token exists - let the request proceed
    // Backend authentication will validate the httpOnly cookie
  }
  
  // If on login page and has valid token, redirect to dashboard
  if (pathname === "/login") {
    const token = request.cookies.get("access_token")?.value;
    if (token && token.trim() !== "") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/verify-email"
  ],
};