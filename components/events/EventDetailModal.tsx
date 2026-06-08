"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils/formatters'
import { MapPin, Clock, Users, Building2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EventDetail {
  id: string
  title: string
  type: string
  description: string | null
  scheduled_at: string
  location: string | null
  budget: number | null
  actual_cost: number | null
  status: string
  notes: string | null
  result_notes: string | null
}

interface Participant {
  id: string
  hcp_id: string | null
  hco_id: string | null
  attended: boolean
  participant_name: string | null
  hcps: { name: string } | null
  hcos: { name: string } | null
}

interface EventDetailModalProps {
  eventId: string
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

const typeLabels: Record<string, string> = {
  palestra: 'Palestra',
  jantar: 'Jantar',
  simposio: 'Simpósio',
  congresso: 'Congresso',
  workshop: 'Workshop',
  outro: 'Outro',
}

const statusConfig: Record<string, { badge: 'success' | 'neutral' | 'info'; label: string }> = {
  scheduled: { badge: 'info', label: 'Agendado' },
  completed: { badge: 'success', label: 'Realizado' },
  cancelled: { badge: 'neutral', label: 'Cancelado' },
}

export function EventDetailModal({ eventId, open, onClose, onUpdated }: EventDetailModalProps) {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    async function fetchDetail() {
      setLoading(true)
      const supabase = createClient()

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventData) setEvent(eventData as EventDetail)

      const { data: parts } = await supabase
        .from('event_participants')
        .select('id, hcp_id, hco_id, attended, participant_name, hcps(name), hcos(name)')
        .eq('event_id', eventId)

      if (parts) setParticipants(parts as unknown as Participant[])

      setLoading(false)
    }

    fetchDetail()
  }, [open, eventId])

  if (loading || !event) {
    return (
      <ResponsiveModal open={open} onClose={onClose} title="Evento" size="md" scrollable>
        <div className="flex items-center justify-center py-8">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-[3px] border-border" />
            <div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" />
          </div>
        </div>
      </ResponsiveModal>
    )
  }

  const config = statusConfig[event.status] ?? statusConfig.cancelled
  const attendedCount = participants.filter(p => p.attended).length

  return (
    <ResponsiveModal open={open} onClose={onClose} title={event.title} size="md" scrollable>
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={config.badge}>{config.label}</Badge>
          <Badge variant="neutral">{typeLabels[event.type] ?? event.type}</Badge>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-text-secondary">{event.description}</p>
        )}

        {/* Details grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-primary">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <span>{formatDateTime(event.scheduled_at)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Budget/Cost comparison */}
        {(event.budget != null || event.actual_cost != null) && (
          <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Financeiro</h4>
            <div className="grid grid-cols-2 gap-3">
              {event.budget != null && (
                <div>
                  <p className="text-[10px] text-text-muted">Orçamento</p>
                  <p className="text-sm font-semibold text-text-primary">R$ {event.budget.toFixed(2)}</p>
                </div>
              )}
              {event.actual_cost != null && (
                <div>
                  <p className="text-[10px] text-text-muted">Custo Real</p>
                  <p className={cn(
                    'text-sm font-semibold',
                    event.budget != null && event.actual_cost > event.budget ? 'text-danger' : 'text-success'
                  )}>
                    R$ {event.actual_cost.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            {/* Visual bar comparison */}
            {event.budget != null && event.actual_cost != null && (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Orçamento</span>
                    <span>R$ {event.budget.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-border/50 rounded-full overflow-hidden">
                    <div className="h-full bg-text-muted rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Custo Real</span>
                    <span>R$ {event.actual_cost.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        event.actual_cost <= event.budget ? 'bg-success' : 'bg-danger'
                      )}
                      style={{ width: `${Math.min((event.actual_cost / event.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={cn(
                  'text-xs font-medium px-2 py-1 rounded-md inline-block',
                  event.actual_cost <= event.budget ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                )}>
                  {event.actual_cost <= event.budget
                    ? `✓ Economia de R$ ${(event.budget - event.actual_cost).toFixed(2)}`
                    : `⚠ Excedeu R$ ${(event.actual_cost - event.budget).toFixed(2)}`}
                </div>
              </div>
            )}
            {event.budget != null && event.actual_cost == null && (
              <p className="text-xs text-text-muted italic">Custo ainda não registrado</p>
            )}
          </div>
        )}

        {/* Participants */}
        {participants.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Participantes ({event.status === 'completed' ? `${attendedCount}/${participants.length} presentes` : participants.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
                    event.status === 'completed'
                      ? p.attended ? 'bg-success-light border-success-border' : 'bg-surface border-border opacity-60'
                      : 'bg-surface border-border'
                  )}
                >
                  {p.hcp_id ? <Users className="w-3.5 h-3.5 text-accent shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-info shrink-0" />}
                  <span className="flex-1 text-text-primary">
                    {p.participant_name
                      ? `${p.participant_name}${p.hcos?.name ? ` · ${p.hcos.name}` : ''}`
                      : p.hcps?.name || p.hcos?.name || 'Participante'}
                  </span>
                  {event.status === 'completed' && (
                    p.attended
                      ? <CheckCircle2 className="w-4 h-4 text-success" />
                      : <XCircle className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {event.notes && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Observações</h4>
            <p className="text-sm text-text-primary">{event.notes}</p>
          </div>
        )}

        {/* Result notes */}
        {event.result_notes && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Resultado</h4>
            <p className="text-sm text-text-primary">{event.result_notes}</p>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full">
          Fechar
        </Button>
      </div>
    </ResponsiveModal>
  )
}
