import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/auth/access-token";

// Optimistic page guard only. API routes verify the access token themselves.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const user = token ? await verifyAccessToken(token) : null;
  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    return user ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  }
  if (user) return NextResponse.next();

  // Access token missing or expired: try the refresh token, then come back here.
  const refreshUrl = new URL("/api/auth/refresh", request.url);
  refreshUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(refreshUrl);
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/profile/:path*"],
};
