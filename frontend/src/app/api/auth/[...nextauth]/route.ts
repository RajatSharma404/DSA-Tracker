import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required");
}

const allowInsecureCredentialsLogin =
  process.env.ALLOW_INSECURE_CREDENTIALS_LOGIN === "true";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
        const dbUser = await prisma.user.upsert({
          where: { email: tokenEmail },
          update: {},
          create: {
            email: tokenEmail,
            role: "USER",
            name: token.name?.toString() || null,
          },
        });
        token.sub = dbUser.id;
        token.role = dbUser.role;
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
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
