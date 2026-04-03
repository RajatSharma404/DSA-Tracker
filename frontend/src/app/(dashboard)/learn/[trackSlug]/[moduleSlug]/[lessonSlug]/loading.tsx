export default function LearnLessonLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-80 rounded-xl bg-white/8" />
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="h-[75vh] rounded-4xl bg-white/6" />
        <div className="h-[75vh] rounded-4xl bg-white/6" />
      </div>
    </div>
  );
}
