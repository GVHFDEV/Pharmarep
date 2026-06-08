export default function HcpsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-20 bg-border rounded animate-pulse" />
          <div className="h-4 w-48 bg-border/60 rounded mt-2 animate-pulse" />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="h-11 w-full bg-surface rounded-xl animate-pulse" />

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-4 shadow-sm animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-border rounded" />
                <div className="h-3 w-48 bg-border/60 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
