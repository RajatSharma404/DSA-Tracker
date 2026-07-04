import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DSA Tracker Pro",
  description: "Track your Data Structures and Algorithms progress like a pro.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased font-sans bg-[#0a0a0a] text-gray-100 flex h-screen overflow-hidden">
        <ErrorBoundary>
          <NextAuthProvider>
            <ToastProvider />
            {children}
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
