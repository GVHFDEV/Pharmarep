export default function SurveysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-border rounded animate-pulse" />
          <div className="h-4 w-48 bg-border/60 rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 shadow-sm animate-pulse border border-border" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-4 w-40 bg-border rounded mb-2" />
            <div className="h-3 w-64 bg-border/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
