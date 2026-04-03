import dynamic from "next/dynamic";

const Sidebar = dynamic(
  () => import("@/components/layout/Sidebar").then((mod) => mod.Sidebar),
  {
    loading: () => (
      <aside className="hidden md:block w-64 shrink-0 border-r border-white/5 bg-[#0a0a0a]" />
    ),
  },
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
