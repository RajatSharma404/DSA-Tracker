export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-white/8" />
      <div className="h-28 rounded-3xl bg-white/6" />
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8 h-72 rounded-4xl bg-white/6" />
        <div className="md:col-span-4 space-y-4">
          <div className="h-28 rounded-3xl bg-white/6" />
          <div className="h-28 rounded-3xl bg-white/6" />
          <div className="h-28 rounded-3xl bg-white/6" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-28 rounded-2xl bg-white/6" />
      </div>
    </div>
  );
}
