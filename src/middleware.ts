import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // No authentication - allow all routes
  return NextResponse.next();
}

// No route protection
export const config = {
  matcher: [],
};