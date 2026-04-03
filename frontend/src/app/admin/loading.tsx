export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-60 rounded-xl bg-white/8" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-28 rounded-2xl bg-white/6" />
      </div>
      <div className="h-96 rounded-3xl bg-white/6" />
    </div>
  );
}
