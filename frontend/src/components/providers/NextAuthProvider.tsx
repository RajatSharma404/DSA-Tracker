"use client";

import { SessionProvider } from "next-auth/react";
import ScrollRevealProvider from "@/components/providers/ScrollRevealProvider";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ScrollRevealProvider />
      {children}
    </SessionProvider>
  );
}
