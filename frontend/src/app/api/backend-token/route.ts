import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import { SignJWT } from "jose";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/backend-token
 * Mints an HS256 JWT using jose for authenticated NextAuth sessions.
 * Claims: { sub, email, role }, iss: "dsa-web", aud: "dsa-api", exp: 10 minutes.
 * Signed with BACKEND_JWT_SECRET (min 32 bytes).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error("[backend-token] BACKEND_JWT_SECRET is missing or less than 32 bytes");
    return NextResponse.json(
      { error: "Internal server error: BACKEND_JWT_SECRET misconfigured" },
      { status: 500 },
    );
  }

  const nextAuthSecret =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();

  // 1. Next.js App Router standard: extract decoded JWT from request cookie
  let email: string | null = null;
  let role = "USER";
  let sub: string | null = null;

  try {
    const token = await getToken({
      req,
      secret: nextAuthSecret,
    });
    if (token?.email) {
      email = token.email as string;
      role = (token.role as string) || "USER";
      sub = (token.sub as string) || email;
    }
  } catch (err) {
    console.warn("[backend-token] getToken error, falling back to getServerSession:", err);
  }

  // 2. Fallback to getServerSession if getToken didn't resolve
  if (!email) {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        email = session.user.email;
        role = (session.user as { role?: string }).role || "USER";
        sub = (session.user as { id?: string }).id || email;
      }
    } catch (err) {
      console.warn("[backend-token] getServerSession error:", err);
    }
  }

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = new TextEncoder().encode(secret);

  const jwt = await new SignJWT({
    sub: sub || email,
    email,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("dsa-web")
    .setAudience("dsa-api")
    .setExpirationTime("10m")
    .sign(key);

  return NextResponse.json({
    token: jwt,
    expiresIn: 600, // 10 minutes (in seconds)
  });
}


