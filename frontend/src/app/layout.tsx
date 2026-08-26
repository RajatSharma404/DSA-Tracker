import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PwaProvider } from "@/components/providers/PwaProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
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
      className={`${outfit.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      data-scroll-behavior="smooth"
      data-theme="oled"
    >
      <body className="antialiased font-sans h-screen w-full overflow-hidden m-0 p-0">
        <ErrorBoundary>
          <ThemeProvider>
            <PwaProvider>
              <NextAuthProvider>
                <ToastProvider />
                {children}
              </NextAuthProvider>
            </PwaProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
