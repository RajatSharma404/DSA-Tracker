import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { THEME_BOOT_SCRIPT } from "@/lib/themes";
import { PwaProvider } from "@/components/providers/PwaProvider";
import { MobileProvider } from "@/components/providers/MobileProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});


export const metadata: Metadata = {
  title: "DSA Tracker Pro - Precision Technical Interview System",
  description: "Comprehensive Data Structures & Algorithms mastery platform featuring 3D visual campus, SM-2 spaced repetition, and AI guidance.",
  manifest: "/manifest.json",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      data-theme="graphite"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased font-sans h-screen w-full overflow-hidden m-0 p-0">
        <ErrorBoundary>
          <ThemeProvider>
            <PwaProvider>
              <MobileProvider>
                <NextAuthProvider>
                  <ToastProvider />
                  {children}
                </NextAuthProvider>
              </MobileProvider>
            </PwaProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
