export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="h-6 w-36 bg-border rounded animate-pulse" />
      
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-xl p-6 shadow-sm animate-pulse space-y-3"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-4 w-28 bg-border rounded" />
          <div className="h-10 w-full bg-border/40 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
