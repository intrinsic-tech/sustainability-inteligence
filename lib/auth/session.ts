import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_TTL,
  signAccessToken,
  verifyAccessToken,
  type SessionUser,
} from "./access-token";

// Accepts both `await cookies()` (Server Actions) and `response.cookies` (Route Handlers).
type CookieJar = {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      maxAge: number;
    },
  ): unknown;
};

// A refresh token presented again within this window of being rotated is treated as
// a race between tabs rather than theft, so it doesn't revoke every session.
const REUSE_GRACE_MS = 10_000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function setCookie(jar: CookieJar, name: string, value: string, path: string, maxAge: number) {
  jar.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path,
    maxAge,
  });
}

export function clearSessionCookies(jar: CookieJar) {
  setCookie(jar, ACCESS_COOKIE, "", "/", 0);
  setCookie(jar, REFRESH_COOKIE, "", REFRESH_COOKIE_PATH, 0);
}

/** Re-signs only the access token, e.g. after the user's profile changed. */
export async function setAccessCookie(user: SessionUser, jar: CookieJar) {
  setCookie(jar, ACCESS_COOKIE, await signAccessToken(user), "/", ACCESS_TOKEN_TTL);
}

/** Issues a fresh access + refresh token pair and writes both cookies. */
export async function createSession(user: SessionUser, jar: CookieJar) {
  const refreshToken = randomBytes(32).toString("base64url");
  const { error } = await createServerSupabase()
    .from("refresh_tokens")
    .insert({
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000).toISOString(),
    });
  if (error) throw new Error(`Failed to store refresh token: ${error.message}`);

  await setAccessCookie(user, jar);
  setCookie(jar, REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_PATH, REFRESH_TOKEN_TTL);
}

/**
 * Exchanges a refresh token for a new token pair (rotation). Returns null when the
 * token is unknown, expired or already used; reuse of an old token revokes all of
 * the user's sessions.
 */
export async function rotateSession(refreshToken: string, jar: CookieJar) {
  const supabase = createServerSupabase();
  const { data: stored, error } = await supabase
    .from("refresh_tokens")
    .select("id, user_id, expires_at, revoked_at")
    .eq("token_hash", hashToken(refreshToken))
    .maybeSingle();
  if (error) throw new Error(`Refresh token lookup failed: ${error.message}`);
  if (!stored) return null;

  if (stored.revoked_at) {
    if (Date.now() - Date.parse(stored.revoked_at) > REUSE_GRACE_MS) {
      await supabase
        .from("refresh_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", stored.user_id)
        .is("revoked_at", null);
    }
    return null;
  }
  if (Date.parse(stored.expires_at) <= Date.now()) return null;

  // Conditional update so two concurrent refreshes can't both claim the same token.
  const { data: claimed } = await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", stored.id)
    .is("revoked_at", null)
    .select("id");
  if (!claimed?.length) return null;

  // Re-read the user so role/name changes and deleted accounts take effect on refresh.
  const { data: user } = await supabase
    .from("Users")
    .select("id, name, email, role")
    .eq("id", stored.user_id)
    .maybeSingle();
  if (!user) return null;

  await createSession(user, jar);
  return user as SessionUser;
}

export async function revokeSession(refreshToken: string) {
  await createServerSupabase()
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", hashToken(refreshToken))
    .is("revoked_at", null);
}

/** Signs the user out everywhere, e.g. after a password change. */
export async function revokeAllSessions(userId: SessionUser["id"]) {
  const { error } = await createServerSupabase()
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (error) throw new Error(`Failed to revoke sessions: ${error.message}`);
}

/** The signed-in user for the current request, or null if the access token is missing/expired. */
export async function getSessionUser() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return token ? verifyAccessToken(token) : null;
}
