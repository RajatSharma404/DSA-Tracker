"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Activity,
  RotateCcw,
  Menu,
} from "lucide-react";

interface MobileBottomNavProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

export function MobileBottomNav({
  isDrawerOpen,
  onToggleDrawer,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Roadmap", href: "/roadmap", icon: Network },
    { label: "Tracer", href: "/tracer", icon: Activity },
    { label: "Review", href: "/review", icon: RotateCcw },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--bg-secondary)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] px-2 flex items-center justify-around md:hidden pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile primary navigation"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "text-[var(--accent-primary)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <div className="relative">
              <item.icon size={20} className={isActive ? "scale-110" : ""} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-primary)] shadow-[0_0_6px_var(--accent-glow)]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu / More toggle */}
      <button
        onClick={onToggleDrawer}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          isDrawerOpen
            ? "text-[var(--accent-primary)] font-semibold"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
        aria-label="Toggle full menu drawer"
        aria-expanded={isDrawerOpen}
      >
        <Menu size={20} className={isDrawerOpen ? "rotate-90 transition-transform" : ""} />
        <span className="text-[10px] tracking-tight mt-1">Menu</span>
      </button>
    </nav>
  );
}
