import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 p-6 md:p-10">
        {children}
      </main>
    </>
  );
}
