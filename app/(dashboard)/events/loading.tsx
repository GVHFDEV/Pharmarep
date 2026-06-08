export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-border rounded animate-pulse" />
          <div className="h-4 w-56 bg-border/60 rounded mt-2 animate-pulse" />
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface rounded-full animate-pulse" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-4 shadow-sm animate-pulse border-l-4 border-border"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 bg-border rounded" />
                <div className="h-5 w-20 bg-border/60 rounded-full" />
              </div>
              <div className="h-3 w-24 bg-border/40 rounded" />
              <div className="flex gap-4 mt-2">
                <div className="h-3 w-32 bg-border/40 rounded" />
                <div className="h-3 w-28 bg-border/40 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
