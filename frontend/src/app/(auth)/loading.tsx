export default function AuthLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        <div className="h-12 w-12 rounded-2xl bg-white/10" />
        <div className="h-8 w-2/3 rounded-full bg-white/10" />
        <div className="h-4 w-full rounded-full bg-white/10" />
        <div className="h-12 w-full rounded-2xl bg-white/10" />
        <div className="h-12 w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
