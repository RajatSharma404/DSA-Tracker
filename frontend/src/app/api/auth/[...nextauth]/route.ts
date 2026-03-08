import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      try {
        // Upsert user in DB manually (works without adapter)
        await prisma.user.upsert({
          where: { email: user.email },
          update: { name: user.name, image: user.image },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: "USER",
          },
        });
      } catch (error) {
        console.error("DB upsert error during signIn:", error);
        // Still allow sign-in even if DB fails
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true },
          });
          token.id = dbUser?.id ?? user.id;
          token.role = dbUser?.role ?? "USER";
        } catch {
          token.id = user.id;
          token.role = "USER";
        }
        token.accessToken = jwt.sign(
          { id: token.id, role: token.role },
          process.env.NEXTAUTH_SECRET || "fallback_secret",
          { expiresIn: "7d" },
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
