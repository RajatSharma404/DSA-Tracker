export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-xl bg-white/8" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-72 rounded-4xl bg-white/6" />
        <div className="h-72 rounded-4xl bg-white/6" />
      </div>
      <div className="h-96 rounded-4xl bg-white/6" />
    </div>
  );
}
