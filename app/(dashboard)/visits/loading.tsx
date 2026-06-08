export default function VisitsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-border rounded animate-pulse" />
          <div className="h-4 w-52 bg-border/60 rounded mt-2 animate-pulse" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-surface rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-4 shadow-sm animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 bg-border rounded" />
                <div className="h-5 w-20 bg-border/60 rounded-full" />
              </div>
              <div className="h-3 w-48 bg-border/60 rounded" />
              <div className="h-3 w-32 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
