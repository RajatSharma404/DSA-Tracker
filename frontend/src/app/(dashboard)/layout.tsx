"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ExtensionStatusBadge } from "@/components/layout/ExtensionStatusBadge";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { PageTransition } from "@/components/layout/PageTransition";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

const Sidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((mod) => mod.Sidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden md:block w-16 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]" />
    ),
  },
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-250">
      {/* Desktop Sidebar (hidden on < md screens) */}
      <Sidebar />

      {/* Mobile Top Header (hidden on md+ screens) */}
      <MobileHeader
        isDrawerOpen={isMobileDrawerOpen}
        onToggleDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 pt-16 pb-20 px-4 sm:pt-6 sm:pb-6 sm:px-6 lg:p-8"
        data-scroll-root="true"
      >
        <div
          className="hidden lg:block fixed left-1/2 top-4 z-30 -translate-x-1/2"
          data-scroll-reveal-ignore
        >
          <ExtensionStatusBadge />
        </div>
        <PageTransition>
          {children}
        </PageTransition>
        <CommandPalette />
      </main>

      {/* Mobile Bottom Dock Navigation Bar (hidden on md+ screens) */}
      <MobileBottomNav
        isDrawerOpen={isMobileDrawerOpen}
        onToggleDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Mobile Full Navigation Slide-over Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </div>
  );
}
