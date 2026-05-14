export function CardSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-white/10 mb-3" />
      <div className="h-8 w-2/3 rounded bg-white/10 mb-2" />
      <div className="h-3 w-1/2 rounded bg-white/10" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-3 animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="flex-1">
            <div className="h-3 w-3/4 rounded bg-white/10 mb-2" />
            <div className="h-2 w-1/2 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-white/10 mb-4" />
      <div className="h-[200px] w-full rounded bg-white/10" />
    </div>
  );
}
