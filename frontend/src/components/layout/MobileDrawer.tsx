"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  Network,
  Swords,
  Activity,
  BookOpen,
  Target,
  Zap,
  RotateCcw,
  Sparkles,
  Building2,
  Brain,
  Search,
  BarChart3,
  Trophy,
  FileText,
  Puzzle,
  Library,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { ThemeSelector } from "@/components/ui/ThemeSelector";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Practice",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: GraduationCap, label: "Learn", href: "/learn" },
      { icon: Network, label: "Visual Roadmap", href: "/roadmap" },
      { icon: Swords, label: "1v1 PvP Battles", href: "/pvp" },
      { icon: Activity, label: "AlgoTracer 2.0", href: "/tracer" },
      { icon: BookOpen, label: "Topics", href: "/topics" },
      { icon: Target, label: "DSA City", href: "/city" },
      { icon: Zap, label: "The Arena", href: "/challenge" },
      { icon: Target, label: "Mock Interviews", href: "/interviews" },
    ],
  },
  {
    title: "Review",
    items: [
      { icon: RotateCcw, label: "Review Queue", href: "/review" },
      { icon: Sparkles, label: "Flashcards SM-2", href: "/flashcards" },
      { icon: Building2, label: "Company Tracks", href: "/company-tracks" },
      { icon: Brain, label: "AI Recommend", href: "/recommendations" },
      { icon: Search, label: "Explore Problems", href: "/search" },
    ],
  },
  {
    title: "Analyze",
    items: [
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: Trophy, label: "Achievements", href: "/achievements" },
      { icon: FileText, label: "Weekly Report", href: "/weekly-report" },
    ],
  },
  {
    title: "Manage",
    items: [
      { icon: Puzzle, label: "Extension Hub", href: "/extension" },
      { icon: Library, label: "The Vault", href: "/vault" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin =
    ((session?.user as { role?: string } | undefined)?.role || "USER") ===
    "ADMIN";

  const displaySections = navSections.map((section) => ({
    ...section,
    items: [...section.items],
  }));

  if (isAdmin) {
    const manageSection = displaySections.find(
      (section) => section.title === "Manage",
    );
    if (manageSection) {
      manageSection.items.push({
        icon: ShieldCheck,
        label: "Admin Panel",
        href: "/admin",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content container */}
      <aside
        className="relative ml-auto flex flex-col w-[85%] max-w-sm h-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-l border-[var(--border-subtle)] shadow-2xl z-10 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Header with logo & close */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]" />
            <span className="text-[var(--text-primary)] font-bold text-lg tracking-wide font-display">
              DSA Pro
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Link Sections */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {displaySections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center px-3 py-2.5 rounded-xl transition-all text-sm font-medium cursor-pointer ${
                        isActive
                          ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/30"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={`shrink-0 mr-3 ${
                          isActive
                            ? "text-[var(--accent-primary)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Theme Selector Section */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Appearance Theme
            </p>
            <ThemeSelector variant="pills" />
          </div>
        </nav>

        {/* Footer with User info & Sign out */}
        <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-tertiary)]">
          {session?.user && (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <div
                  className="w-9 h-9 rounded-full bg-cover bg-center border border-[var(--border-subtle)]"
                  style={{ backgroundImage: `url(${session.user.image})` }}
                  aria-label={`${session.user.name}'s avatar`}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 flex items-center justify-center text-xs font-bold">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] truncate">
                  {session.user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors cursor-pointer border border-[var(--border-subtle)]"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}
