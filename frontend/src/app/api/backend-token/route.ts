import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SignJWT } from "jose";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/backend-token
 * Mints an HS256 JWT using jose for authenticated NextAuth sessions.
 * Claims: { sub, email, role }, iss: "dsa-web", aud: "dsa-api", exp: 10 minutes.
 * Signed with BACKEND_JWT_SECRET (min 32 bytes).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error("[backend-token] BACKEND_JWT_SECRET is missing or less than 32 bytes");
    return NextResponse.json(
      { error: "Internal server error: BACKEND_JWT_SECRET misconfigured" },
      { status: 500 },
    );
  }

  const role = (session.user as { role?: string }).role || "USER";
  const sub = (session.user as { id?: string }).id || session.user.email;
  const key = new TextEncoder().encode(secret);

  const token = await new SignJWT({
    sub,
    email: session.user.email,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("dsa-web")
    .setAudience("dsa-api")
    .setExpirationTime("10m")
    .sign(key);

  return NextResponse.json({
    token,
    expiresIn: 600, // 10 minutes (in seconds)
  });
}

