export default function RoadmapLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 w-72 rounded-xl bg-white/8" />
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="min-h-[72vh] rounded-4xl bg-white/6" />
        <div className="min-h-[72vh] rounded-4xl bg-white/6" />
      </div>
    </div>
  );
}
