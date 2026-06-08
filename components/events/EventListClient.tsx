"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isFuture, isPast } from 'date-fns'
import { EventCard } from './EventCard'
import { EventResult } from './EventResult'
import { EventDetailModal } from './EventDetailModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

type EventWithCount = {
  id: string
  title: string
  type: string
  scheduled_at: string
  status: string
  location: string | null
  budget: number | null
  actual_cost: number | null
  notes: string | null
  description: string | null
  participant_count: number
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'completed', label: 'Realizados' },
  { value: 'cancelled', label: 'Cancelados' },
]

export function EventListClient({ refreshKey = 0 }: { refreshKey?: number }) {
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*, event_participants(id)')
      .order('scheduled_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar eventos.')
      setLoading(false)
      return
    }

    if (data) {
      const mapped: EventWithCount[] = data.map((e: Record<string, unknown>) => ({
        id: e.id as string,
        title: e.title as string,
        type: e.type as string,
        scheduled_at: e.scheduled_at as string,
        status: e.status as string,
        location: e.location as string | null,
        budget: e.budget as number | null,
        actual_cost: e.actual_cost as number | null,
        notes: e.notes as string | null,
        description: e.description as string | null,
        participant_count: Array.isArray(e.event_participants) ? e.event_participants.length : 0,
      }))
      setEvents(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents, refreshKey])

  const filteredEvents = events.filter((event) => {
    switch (filter) {
      case 'upcoming':
        return event.status === 'scheduled' && isFuture(new Date(event.scheduled_at))
      case 'completed':
        return event.status === 'completed'
      case 'cancelled':
        return event.status === 'cancelled'
      default:
        return true
    }
  })

  // Group by upcoming/past
  const upcoming = filteredEvents.filter(e => e.status === 'scheduled' && isFuture(new Date(e.scheduled_at)))
  const past = filteredEvents.filter(e => e.status !== 'scheduled' || isPast(new Date(e.scheduled_at)))

  const handleRegisterResult = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowResult(true)
  }

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowDetail(true)
  }

  const handleDeleteRequest = (eventId: string) => {
    setDeleteEventId(eventId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteEventId) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', deleteEventId)
    setDeleting(false)

    if (error) {
      toast.error('Erro ao excluir evento.')
      return
    }
    toast.success('Evento excluído!')
    setShowDeleteConfirm(false)
    setDeleteEventId(null)
    fetchEvents()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-accent text-text-on-accent'
                : 'bg-surface-2 text-text-secondary hover:bg-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">Nenhum evento encontrado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Próximos</h3>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegisterResult={handleRegisterResult}
                    onDelete={handleDeleteRequest}
                    onClick={handleEventClick}
                  />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Anteriores</h3>
              <div className="space-y-3">
                {past.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegisterResult={event.status === 'scheduled' ? handleRegisterResult : undefined}
                    onDelete={handleDeleteRequest}
                    onClick={handleEventClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Result Modal */}
      {selectedEventId && showResult && (
        <EventResult
          eventId={selectedEventId}
          open={showResult}
          onClose={() => { setShowResult(false); setSelectedEventId(null) }}
          onSaved={fetchEvents}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEventId && showDetail && (
        <EventDetailModal
          eventId={selectedEventId}
          open={showDetail}
          onClose={() => { setShowDetail(false); setSelectedEventId(null) }}
          onUpdated={fetchEvents}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteEventId(null) }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  )
}
