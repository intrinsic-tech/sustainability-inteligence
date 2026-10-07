import { jwtVerify, SignJWT } from "jose";

// Kept free of "server-only" so proxy.ts can import it as well.

export type SessionUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
};

export const ACCESS_COOKIE = "si_access";
export const REFRESH_COOKIE = "si_refresh";
export const ACCESS_TOKEN_TTL = 15 * 60; // seconds
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // seconds
// The refresh cookie is only ever sent to the refresh/logout endpoints.
export const REFRESH_COOKIE_PATH = "/api/auth";

const ISSUER = "sustainability-intelligence";
const AUDIENCE = "sustainability-intelligence:api";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export function signAccessToken(user: SessionUser) {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: String(payload.role ?? "user"),
    };
  } catch {
    return null;
  }
}
