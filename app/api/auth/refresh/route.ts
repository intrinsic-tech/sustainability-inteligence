import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/lib/auth/access-token";
import { clearSessionCookies, rotateSession } from "@/lib/auth/session";

// Only same-origin paths, so `next` can't be used as an open redirect.
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/dashboard";
}

async function refresh(request: NextRequest, response: NextResponse) {
  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  try {
    if (token && (await rotateSession(token, response.cookies))) return true;
  } catch (error) {
    console.error("Session refresh failed", error);
  }
  clearSessionCookies(response.cookies);
  return false;
}

// Called by the client fetch wrapper after an API call returns 401.
export async function POST(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  if (await refresh(request, response)) return response;
  const failed = NextResponse.json({ error: "unauthorized" }, { status: 401 });
  clearSessionCookies(failed.cookies);
  return failed;
}

// proxy.ts redirects page navigations here when the access token has expired.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));
  if (await refresh(request, response)) return response;
  const failed = NextResponse.redirect(new URL("/", request.url));
  clearSessionCookies(failed.cookies);
  return failed;
}
