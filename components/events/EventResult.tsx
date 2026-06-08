"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils/cn'

interface Participant {
  id: string
  hcp_id: string | null
  hco_id: string | null
  attended: boolean
  participant_name: string | null
  hcps: { name: string } | null
  hcos: { name: string } | null
}

interface EventData {
  id: string
  title: string
  budget: number | null
}

interface EventResultProps {
  eventId: string
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EventResult({ eventId, open, onClose, onSaved }: EventResultProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'completed' | 'cancelled'>('completed')
  const [actualCost, setActualCost] = useState('')
  const [resultNotes, setResultNotes] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [attendees, setAttendees] = useState<Set<string>>(new Set())
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    async function fetchData() {
      setDataLoading(true)
      const supabase = createClient()

      // Fetch event
      const { data: event } = await supabase
        .from('events')
        .select('id, title, budget')
        .eq('id', eventId)
        .single()

      if (event) setEventData(event)

      // Fetch participants
      const { data: parts } = await supabase
        .from('event_participants')
        .select('id, hcp_id, hco_id, attended, participant_name, hcps(name), hcos(name)')
        .eq('event_id', eventId)

      if (parts) {
        setParticipants(parts as unknown as Participant[])
        setAttendees(new Set(parts.filter(p => p.attended).map(p => p.id)))
      }

      setDataLoading(false)
    }

    fetchData()
    setStatus('completed')
    setActualCost('')
    setResultNotes('')
  }, [open, eventId])

  function toggleAttendee(participantId: string) {
    setAttendees(prev => {
      const next = new Set(prev)
      if (next.has(participantId)) next.delete(participantId)
      else next.add(participantId)
      return next
    })
  }

  function selectAll() {
    setAttendees(new Set(participants.map(p => p.id)))
  }

  function deselectAll() {
    setAttendees(new Set())
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()

    try {
      // Update event
      const { error: eventError } = await supabase
        .from('events')
        .update({
          status,
          actual_cost: actualCost ? parseFloat(actualCost) : null,
          result_notes: resultNotes || null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', eventId)

      if (eventError) throw eventError

      // Update attendance
      if (status === 'completed') {
        for (const participant of participants) {
          const { error } = await supabase
            .from('event_participants')
            .update({ attended: attendees.has(participant.id) })
            .eq('id', participant.id)
          if (error) throw error
        }
      }

      toast.success('Resultado do evento registrado!')
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao salvar resultado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const costNum = actualCost ? parseFloat(actualCost) : 0
  const budgetNum = eventData?.budget ?? 0
  const overBudget = costNum > budgetNum && budgetNum > 0

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Registrar Resultado" size="md" scrollable>
      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-[3px] border-border" />
            <div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" />
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  status === 'completed'
                    ? 'bg-accent text-text-on-accent border-accent'
                    : 'bg-surface text-text-secondary border-border hover:bg-surface-2'
                )}
              >
                Realizado
              </button>
              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  status === 'cancelled'
                    ? 'bg-accent text-text-on-accent border-accent'
                    : 'bg-surface text-text-secondary border-border hover:bg-surface-2'
                )}
              >
                Cancelado
              </button>
            </div>
          </div>

          {/* Actual Cost */}
          {status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Custo Total (R$)
                {budgetNum > 0 && (
                  <span className="text-xs text-text-muted ml-2">Orçamento: R$ {budgetNum.toFixed(2)}</span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className={cn(
                  'w-full px-3 py-2 text-sm border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus',
                  overBudget ? 'border-danger' : 'border-border'
                )}
              />
              {overBudget && (
                <p className="mt-1 text-xs text-danger">⚠️ Acima do orçamento em R$ {(costNum - budgetNum).toFixed(2)}</p>
              )}
              {costNum > 0 && !overBudget && budgetNum > 0 && (
                <p className="mt-1 text-xs text-success">✓ Dentro do orçamento (economia de R$ {(budgetNum - costNum).toFixed(2)})</p>
              )}
            </div>
          )}

          {/* Attendance */}
          {status === 'completed' && participants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Presença ({attendees.size}/{participants.length})
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-[10px] text-accent hover:underline">
                    Todos
                  </button>
                  <button type="button" onClick={deselectAll} className="text-[10px] text-text-muted hover:underline">
                    Nenhum
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {participants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleAttendee(p.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
                      attendees.has(p.id)
                        ? 'bg-accent-light border-accent-light-border'
                        : 'bg-surface border-border hover:bg-surface-2'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0',
                      attendees.has(p.id) ? 'bg-accent border-accent' : 'border-border'
                    )}>
                      {attendees.has(p.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-primary">
                      {p.participant_name
                        ? `${p.participant_name}${p.hcos?.name ? ` · ${p.hcos.name}` : ''}`
                        : p.hcps?.name || p.hcos?.name || 'Participante'}
                    </span>
                    <span className="text-[10px] text-text-muted ml-auto">
                      {p.hcp_id ? 'HCP' : 'HCO'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Como foi o evento?</label>
            <textarea
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus resize-none"
              placeholder="Descreva como foi o evento, destaques, feedback dos participantes..."
            />
          </div>

          <Button onClick={handleSubmit} loading={loading} className="w-full">
            Salvar Resultado
          </Button>
        </div>
      )}
    </ResponsiveModal>
  )
}
