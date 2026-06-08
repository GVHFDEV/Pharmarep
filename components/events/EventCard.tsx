"use client"

import { motion } from 'framer-motion'
import { formatDateTime } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { MapPin, Clock, CheckCircle2, Trash2, Users, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EventCardProps {
  event: {
    id: string
    title: string
    type: string
    scheduled_at: string
    status: string
    location: string | null
    budget: number | null
    actual_cost: number | null
    participant_count?: number
  }
  onRegisterResult?: (eventId: string) => void
  onDelete?: (eventId: string) => void
  onClick?: (eventId: string) => void
}

const statusConfig: Record<string, { border: string; badge: 'success' | 'neutral' | 'info'; label: string }> = {
  scheduled: { border: 'border-l-accent', badge: 'info', label: 'Agendado' },
  completed: { border: 'border-l-success', badge: 'success', label: 'Realizado' },
  cancelled: { border: 'border-l-neutral', badge: 'neutral', label: 'Cancelado' },
}

const typeLabels: Record<string, string> = {
  palestra: 'Palestra',
  jantar: 'Jantar',
  simposio: 'Simpósio',
  congresso: 'Congresso',
  workshop: 'Workshop',
  outro: 'Outro',
}

export function EventCard({ event, onRegisterResult, onDelete, onClick }: EventCardProps) {
  const config = statusConfig[event.status] ?? statusConfig.cancelled

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'bg-surface border border-border border-l-4 rounded-xl p-4 shadow-sm cursor-pointer',
        config.border
      )}
      onClick={() => onClick?.(event.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate text-sm">
            {event.title}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{typeLabels[event.type] ?? event.type}</p>
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock className="w-3.5 h-3.5 shrink-0 text-accent" />
          <span>{formatDateTime(event.scheduled_at)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.participant_count != null && event.participant_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Users className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span>{event.participant_count} participante{event.participant_count > 1 ? 's' : ''}</span>
          </div>
        )}
        {event.budget != null && (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <DollarSign className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span>R$ {event.budget.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Budget vs Actual comparison for completed events */}
      {event.status === 'completed' && event.budget != null && event.actual_cost != null && (
        <div className="mt-2 px-2 py-1.5 rounded-lg bg-surface-2 border border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Orçamento: R$ {event.budget.toFixed(2)}</span>
            <span className={cn(
              'font-medium',
              event.actual_cost <= event.budget ? 'text-success' : 'text-danger'
            )}>
              Custo: R$ {event.actual_cost.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {event.status === 'scheduled' && onRegisterResult && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); onRegisterResult(event.id) }}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-semibold text-accent bg-accent-light hover:bg-accent hover:text-white py-2 rounded-lg transition-all duration-200 border border-accent-light-border hover:border-accent"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Registrar Resultado
        </motion.button>
      )}

      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
          className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold text-danger bg-danger-light hover:bg-danger hover:text-white py-2 rounded-lg transition-all duration-200 border border-danger-border hover:border-danger"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Excluir
        </motion.button>
      )}
    </motion.div>
  )
}
