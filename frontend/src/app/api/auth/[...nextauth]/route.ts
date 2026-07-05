import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const hasGoogleOAuth = Boolean(googleClientId && googleClientSecret);

if (!hasGoogleOAuth) {
  console.warn(
    "[auth] Google OAuth is disabled because GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are missing.",
  );
}

if (!prisma) {
  // This is expected in frontend-only environments. User sync happens via backend API calls.
  // DATABASE_URL should NOT be exposed to frontend code for security reasons.
}

const allowInsecureCredentialsLogin =
  process.env.ALLOW_INSECURE_CREDENTIALS_LOGIN === "true";

async function upsertAuthUser(email: string, name: string | null) {
  if (!prisma) return null;

  try {
    return await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: "USER",
        name,
      },
    });
  } catch (error) {
    console.error("[auth] Failed to upsert user during JWT callback", error);
    return null;
  }
}

function createAuthOptions(secret: string): NextAuthOptions {
  return {
    providers: [
      ...(hasGoogleOAuth
        ? [
            GoogleProvider({
              clientId: googleClientId!,
              clientSecret: googleClientSecret!,
            }),
          ]
        : []),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          name: { label: "Name", type: "text" },
        },
        async authorize(credentials) {
          // This legacy email-only flow is intentionally disabled by default.
          if (!allowInsecureCredentialsLogin) {
            return null;
          }

          const email = credentials?.email?.toString().trim().toLowerCase();
          const name = credentials?.name?.toString().trim() || "DSA User";

          if (!email || !email.includes("@")) {
            return null;
          }

          return {
            id: email,
            email,
            name,
            image: null,
            role: "USER",
          } as { id: string; email: string; name: string; image: string | null; role: string };
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user }) {
        const tokenEmail =
          user?.email?.toString().trim().toLowerCase() ??
          token.email?.toString().trim().toLowerCase();

        if (user) {
          token.email = tokenEmail;
          token.name = user.name;
          token.picture = user.image;
        }

        if (tokenEmail) {
          const dbUser = await upsertAuthUser(
            tokenEmail,
            token.name?.toString() || null,
          );

          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
          } else {
            token.sub = token.sub ?? tokenEmail;
            token.role = token.role ?? "USER";
          }
        } else {
          token.role = "USER";
        }

        token.accessToken = jwt.sign(
          { email: token.email, role: token.role ?? "USER", sub: token.sub },
          secret,
          { expiresIn: "7d" },
        );
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          interface sessionWithToken { accessToken?: string }
          interface userWithRole { role?: string }
          (session as sessionWithToken).accessToken = token.accessToken as string | undefined;
          (session.user as userWithRole).role = (token.role as string) ?? "USER";
        }
        return session;
      },
    },
    secret,
    pages: {
      signIn: "/login",
      error: "/login",
    },
    logger: {
      error(code, ...message) {
        console.error("[next-auth][error]", code, ...message);
      },
      warn(code) {
        console.warn("[next-auth][warn]", code);
      },
      debug(code, ...message) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[next-auth][debug]", code, ...message);
        }
      },
    },
    debug: process.env.NODE_ENV === "development",
  };
}

function missingSecretResponse() {
  return NextResponse.json(
    { error: "NEXTAUTH_SECRET or AUTH_SECRET is required" },
    { status: 500 },
  );
}

const handler = nextAuthSecret
  ? NextAuth(createAuthOptions(nextAuthSecret))
  : null;

export async function GET(req: Request, context: unknown) {
  if (!handler) {
    console.error(
      "[next-auth][error][NO_SECRET] NEXTAUTH_SECRET or AUTH_SECRET is required",
    );
    return missingSecretResponse();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(req as any, context as any);
}

export async function POST(req: Request, context: unknown) {
  if (!handler) {
    console.error(
      "[next-auth][error][NO_SECRET] NEXTAUTH_SECRET or AUTH_SECRET is required",
    );
    return missingSecretResponse();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(req as any, context as any);
}
