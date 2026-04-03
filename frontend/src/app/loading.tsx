export default function RootLoading() {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0a0a0a] md:block">
        <div className="space-y-4 p-4">
          <div className="h-7 w-24 rounded-lg bg-white/8" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-10 rounded-xl bg-white/6" />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden p-6 md:p-10">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-white/8" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-4xl bg-white/6" />
            <div className="h-80 rounded-4xl bg-white/6" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-white/6" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
