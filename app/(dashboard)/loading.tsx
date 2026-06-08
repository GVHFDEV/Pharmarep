export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-border" />
          <div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" />
        </div>
        <span className="text-sm text-text-secondary animate-pulse">Carregando...</span>
      </div>
    </div>
  )
}
