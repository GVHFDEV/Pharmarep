import { KanbanBoard } from '@/components/pipeline/KanbanBoard'

export default function PipelinePage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Pipeline</h2>
        <p className="text-sm text-text-secondary mt-1">Kanban de relacionamento com HCPs</p>
      </div>
      <KanbanBoard />
    </div>
  )
}
