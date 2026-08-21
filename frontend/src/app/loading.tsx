export default function RootLoading() {
  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] md:block">
        <div className="space-y-4 p-4">
          <div className="h-7 w-24 rounded-lg bg-[var(--bg-card)] animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-10 rounded-xl bg-[var(--bg-card)] animate-pulse" />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden p-6 md:p-10">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-72 rounded-xl bg-[var(--bg-card)]" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-4xl bg-[var(--bg-card)]" />
            <div className="h-80 rounded-4xl bg-[var(--bg-card)]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-[var(--bg-card)]" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
