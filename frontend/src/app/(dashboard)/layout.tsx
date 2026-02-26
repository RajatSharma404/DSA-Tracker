import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full p-8 md:p-12">
        {children}
      </main>
    </>
  );
}
