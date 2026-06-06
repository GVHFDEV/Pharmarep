"use client"

import { motion } from 'framer-motion'
import { formatDateTime } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { MapPin, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface VisitCardProps {
  visit: {
    id: string
    scheduled_at: string
    status: string
    rating: string | null
    location: string | null
    notes: string | null
    hcps: { name: string; specialty: string } | null
    visit_products?: Array<{ samples_delivered: number; products: { name: string } | null }> | null
  }
  onRegisterResult?: (visitId: string) => void
  onDelete?: (visitId: string) => void
}

// Using brand green for scheduled, keeping semantic colors for others
const statusConfig: Record<string, { border: string; badge: 'success' | 'neutral' | 'warning' | 'info'; label: string }> = {
  scheduled: { border: 'border-l-accent',     badge: 'info',    label: 'Agendada' },
  completed: { border: 'border-l-success',    badge: 'success', label: 'Concluída' },
  cancelled:  { border: 'border-l-neutral',   badge: 'neutral', label: 'Cancelada' },
  rescheduled:{ border: 'border-l-warning',   badge: 'warning', label: 'Reagendada' },
}

export function VisitCard({ visit, onRegisterResult, onDelete }: VisitCardProps) {
  const config = statusConfig[visit.status] ?? statusConfig.cancelled

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'bg-surface border border-border border-l-4 rounded-xl p-4 shadow-sm',
        config.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate text-sm">
            {visit.hcps?.name ?? 'HCP não encontrado'}
          </p>
          {visit.hcps?.specialty && (
            <p className="text-xs text-text-muted mt-0.5">{visit.hcps.specialty}</p>
          )}
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 shrink-0 text-accent" />
          <span>{formatDateTime(visit.scheduled_at)}</span>
        </div>
        {visit.location && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span className="truncate">{visit.location}</span>
          </div>
        )}
      </div>

      {/* Products delivered */}
      {visit.visit_products && visit.visit_products.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visit.visit_products.map((vp, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-light text-[10px] font-medium text-accent border border-accent-light-border">
              {vp.products?.name ?? 'Produto'} ×{vp.samples_delivered}
            </span>
          ))}
        </div>
      )}

      {visit.status === 'scheduled' && onRegisterResult && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onRegisterResult(visit.id)}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-accent bg-accent-light hover:bg-accent hover:text-white py-2 rounded-lg transition-all duration-200 border border-accent-light-border hover:border-accent"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Registrar Resultado
        </motion.button>
      )}

      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onDelete(visit.id)}
          className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold text-danger bg-danger-light hover:bg-danger hover:text-white py-2 rounded-lg transition-all duration-200 border border-danger-border hover:border-danger"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Excluir
        </motion.button>
      )}
    </motion.div>
  )
}
