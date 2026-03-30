import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

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
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as any).role ?? "USER";
      }
      token.accessToken = jwt.sign(
        { email: token.email, role: token.role ?? "USER" },
        process.env.NEXTAUTH_SECRET || "fallback_secret",
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
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
