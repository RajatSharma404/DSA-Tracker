export default function LearnLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-xl bg-white/8" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-72 rounded-4xl bg-white/6" />
        <div className="h-72 rounded-4xl bg-white/6" />
      </div>
    </div>
  );
}
