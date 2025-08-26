import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/profile"];
  
  // Check if the current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Check for httpOnly access token cookie
    const token = request.cookies.get("access_token")?.value;
    
    if (!token) {
      // Redirect to login if no token found
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token exists - let the request proceed
    // Backend authentication will validate the httpOnly cookie
  }
  
  // If on login page and has token, redirect to dashboard
  if (pathname === "/login") {
    const token = request.cookies.get("access_token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*", 
    "/login",
    "/register",
    "/verify-email"
  ],
};