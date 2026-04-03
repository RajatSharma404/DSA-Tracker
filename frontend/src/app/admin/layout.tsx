"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Sidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((mod) => mod.Sidebar),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden md:block w-64 shrink-0 border-r border-white/5 bg-[#0a0a0a]" />
    ),
  },
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (session?.user && (session.user as any).role !== "ADMIN")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-[#050505] text-white">
        <aside className="hidden md:block w-64 shrink-0 border-r border-white/5 bg-[#0a0a0a] animate-pulse" />
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-36 rounded-full bg-white/5" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl border border-white/5 bg-white/5"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 p-4">
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-wider">
            Admin Mode
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}
