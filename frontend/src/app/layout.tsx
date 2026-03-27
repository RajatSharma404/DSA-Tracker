import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";

export const metadata: Metadata = {
  title: "DSA Tracker Pro",
  description: "Track your Data Structures and Algorithms progress like a pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a] text-gray-100 flex h-screen overflow-hidden">
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
