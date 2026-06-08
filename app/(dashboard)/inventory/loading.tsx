export default function InventoryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-border rounded animate-pulse" />
          <div className="h-4 w-44 bg-border/60 rounded mt-2 animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-xl p-4 shadow-sm animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="space-y-3">
              <div className="h-5 w-28 bg-border rounded" />
              <div className="h-4 w-20 bg-border/60 rounded" />
              <div className="h-8 w-16 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
