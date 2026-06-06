"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isToday, isTomorrow, isThisWeek, isFuture, isPast, parseISO, isSameDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { List, CalendarDays } from 'lucide-react'
import { VisitCard } from './VisitCard'
import { VisitCalendar } from './VisitCalendar'
import { VisitResult } from './VisitResult'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

type VisitWithHcp = {
  id: string
  scheduled_at: string
  status: string
  rating: string | null
  location: string | null
  notes: string | null
  hcps: { name: string; specialty: string } | null
  visit_products: Array<{ samples_delivered: number; products: { name: string } | null }> | null
}

type FilterType = 'all' | 'today' | 'week' | 'pending' | 'completed'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
]

function groupVisits(visits: VisitWithHcp[]) {
  const groups: { label: string; visits: VisitWithHcp[] }[] = [
    { label: 'Hoje', visits: [] },
    { label: 'Amanhã', visits: [] },
    { label: 'Esta Semana', visits: [] },
    { label: 'Próximas', visits: [] },
    { label: 'Passadas', visits: [] },
  ]

  for (const visit of visits) {
    const date = parseISO(visit.scheduled_at)
    if (isToday(date)) {
      groups[0].visits.push(visit)
    } else if (isTomorrow(date)) {
      groups[1].visits.push(visit)
    } else if (isThisWeek(date) && isFuture(date)) {
      groups[2].visits.push(visit)
    } else if (isFuture(date)) {
      groups[3].visits.push(visit)
    } else if (isPast(date)) {
      groups[4].visits.push(visit)
    }
  }

  return groups.filter((g) => g.visits.length > 0)
}

export function VisitListClient({ refreshKey = 0 }: { refreshKey?: number }) {
  const [visits, setVisits] = useState<VisitWithHcp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDaySheet, setShowDaySheet] = useState(false)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [deleteVisitId, setDeleteVisitId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('visits')
      .select('*, hcps(name, specialty), visit_products(samples_delivered, products(name))')
      .order('scheduled_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar visitas. Tente novamente.')
      setLoading(false)
      return
    }

    if (data) {
      setVisits(data as VisitWithHcp[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits, refreshKey])

  const filteredVisits = visits.filter((visit) => {
    if (filter === 'all') return true
    const date = parseISO(visit.scheduled_at)
    switch (filter) {
      case 'today':
        return isToday(date)
      case 'week':
        return isThisWeek(date)
      case 'pending':
        return visit.status === 'scheduled'
      case 'completed':
        return visit.status === 'completed'
      default:
        return true
    }
  })

  const groupedVisits = groupVisits(filteredVisits)

  const handleRegisterResult = (visitId: string) => {
    setSelectedVisitId(visitId)
    setShowResult(true)
  }

  const handleDeleteRequest = (visitId: string) => {
    setDeleteVisitId(visitId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteVisitId) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('visits').delete().eq('id', deleteVisitId)
    setDeleting(false)

    if (error) {
      toast.error('Erro ao excluir visita. Tente novamente.')
      return
    }
    toast.success('Visita excluída com sucesso!')
    setShowDeleteConfirm(false)
    setDeleteVisitId(null)
    fetchVisits()
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setShowDaySheet(true)
  }

  const visitsForDay = selectedDate
    ? filteredVisits.filter((visit) => isSameDay(parseISO(visit.scheduled_at), selectedDate))
    : []

  return (
    <div className="space-y-4">
      {/* View toggle + Filter buttons */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 flex-1">
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

        {/* View toggle */}
        <div className="flex bg-surface-2 rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md transition-colors ${
              view === 'list'
                ? 'bg-surface text-accent shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label="Visualizar como lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md transition-colors ${
              view === 'calendar'
                ? 'bg-surface text-accent shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label="Visualizar como calendário"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : view === 'calendar' ? (
        /* Calendar view */
        <VisitCalendar visits={filteredVisits} onDayClick={handleDayClick} />
      ) : filteredVisits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">Nenhuma visita encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedVisits.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                {group.label}
              </h3>
              <div className="space-y-3">
                {group.visits.map((visit) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    onRegisterResult={handleRegisterResult}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BottomSheet for selected day's visits */}
      <BottomSheet
        open={showDaySheet}
        onClose={() => setShowDaySheet(false)}
        title={selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: ptBR }) : ''}
      >
        {visitsForDay.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">
            Nenhuma visita neste dia
          </p>
        ) : (
          <div className="space-y-3">
            {visitsForDay.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onRegisterResult={handleRegisterResult}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </BottomSheet>

      {/* Visit Result Registration */}
      {selectedVisitId && (
        <VisitResult
          visitId={selectedVisitId}
          open={showResult}
          onClose={() => {
            setShowResult(false)
            setSelectedVisitId(null)
          }}
          onSaved={fetchVisits}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteVisitId(null) }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Visita"
        message="Tem certeza que deseja excluir esta visita? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  )
}
