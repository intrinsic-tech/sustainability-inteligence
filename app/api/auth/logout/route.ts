import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/lib/auth/access-token";
import { clearSessionCookies, revokeSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  if (token) {
    try {
      await revokeSession(token);
    } catch (error) {
      console.error("Refresh token revocation failed", error);
    }
  }
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response.cookies);
  return response;
}
