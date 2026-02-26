"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Clock, Target, Menu, LogOut, ShieldCheck, Network, Zap } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Network, label: "Visual Roadmap", href: "/roadmap" },
  { icon: BookOpen, label: "Topics", href: "/topics" },
  { icon: Zap, label: "The Arena", href: "/challenge" },
  { icon: Target, label: "Mock Interviews", href: "/interviews" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const displayItems = [...navItems];
  if (isAdmin) {
    displayItems.push({ icon: ShieldCheck, label: "Admin Panel", href: "/admin" });
  }

  return (
    <div
      className={`flex flex-col h-screen bg-[#111111] text-gray-400 border-r border-[#222] transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
        {!collapsed && <span className="text-white font-bold text-lg">DSA Pro</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-[#222] text-gray-400 hover:text-white transition-colors ml-auto"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {displayItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                isActive
                  ? "bg-[#222] text-white border-r-2 border-white"
                  : "hover:bg-[#1a1a1a] hover:text-gray-200"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : ""} />
              {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#222]">
        {session?.user && !collapsed && (
          <div className="flex items-center gap-3 mb-4">
            {session.user.image ? (
              <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                {session.user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{session.user.name}</span>
              <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`flex items-center w-full px-2 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
