export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-28 bg-border rounded animate-pulse" />
      
      {/* Kanban columns skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 min-w-[260px] bg-surface rounded-xl p-4 space-y-3 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-5 w-24 bg-border rounded" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-20 bg-border/40 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
