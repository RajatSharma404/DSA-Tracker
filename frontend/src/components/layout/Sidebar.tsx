"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Menu,
  LogOut,
  ShieldCheck,
  Network,
  Zap,
  Library,
  BarChart3,
  Trophy,
  FileText,
  Settings,
  Search,
  RotateCcw,
  Brain,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

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
      { icon: Brain, label: "AI Recommend", href: "/recommendations" },
      { icon: Search, label: "Explore", href: "/search" },
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
      { icon: Library, label: "The Vault", href: "/vault" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const { data: session } = useSession();

  const routeCollapsed = pathname.startsWith("/challenge/");
  const effectiveCollapsed = routeCollapsed || collapsed;
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
    <div
      className={`flex flex-col h-screen bg-[#111111] text-gray-400 border-r border-[#222] transition-all duration-300 ${
        effectiveCollapsed ? "w-16" : "w-64"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
        {!effectiveCollapsed && (
          <span className="text-white font-bold text-lg">DSA Pro</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#222] text-gray-400 hover:text-white transition-colors ml-auto"
          aria-label={
            effectiveCollapsed ? "Expand navigation" : "Collapse navigation"
          }
          aria-expanded={!effectiveCollapsed}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-2 sm:py-3 scrollbar-hide"
        aria-label="Navigation menu"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {displaySections.map((section) => (
          <div key={section.title} className="mb-2 sm:mb-3">
            {!effectiveCollapsed && (
              <p className="hidden md:block px-4 mb-1 text-[9px] font-black uppercase tracking-widest text-gray-600 line-clamp-1">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors text-[14px] sm:text-base ${
                      isActive
                        ? "bg-[#222] text-white border-r-2 border-white"
                        : "hover:bg-[#1a1a1a] hover:text-gray-200"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={18}
                      className={`sm:w-5 sm:h-5 shrink-0 ${isActive ? "text-white" : ""}`}
                    />
                    {!effectiveCollapsed && (
                      <span className="ml-2 sm:ml-3 font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#222]">
        {session?.user && !effectiveCollapsed && (
          <div className="flex items-center gap-3 mb-4">
            {session.user.image ? (
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${session.user.image})` }}
                aria-label={`${session.user.name}'s profile picture`}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs"
                aria-label="Profile initials"
              >
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {session.user.name}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {session.user.email}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center w-full px-2 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors ${effectiveCollapsed ? "justify-center" : ""}`}
          aria-label="Sign out"
        >
          <LogOut size={20} />
          {!effectiveCollapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
