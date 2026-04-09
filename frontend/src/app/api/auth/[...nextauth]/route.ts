import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required");
}

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

export const authOptions: NextAuthOptions = {
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
        } as any;
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
        nextAuthSecret,
        { expiresIn: "7d" },
      );
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).role = token.role ?? "USER";
      }
      return session;
    },
  },
  secret: nextAuthSecret,
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
