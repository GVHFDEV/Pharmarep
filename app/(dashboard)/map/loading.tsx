export default function MapLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-20 bg-border rounded animate-pulse" />
      {/* Map skeleton */}
      <div className="w-full h-[calc(100vh-200px)] bg-surface rounded-xl animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-border" />
            <div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" />
          </div>
          <span className="text-sm text-text-secondary">Carregando mapa...</span>
        </div>
      </div>
    </div>
  )
}
