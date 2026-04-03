export default function ProblemDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-xl bg-white/8" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[75vh] rounded-3xl bg-white/6" />
        <div className="h-[75vh] rounded-3xl bg-white/6" />
      </div>
    </div>
  );
}
