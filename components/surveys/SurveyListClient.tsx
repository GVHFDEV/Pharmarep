"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { SurveyDetailModal } from './SurveyDetailModal'
import { useToast } from '@/components/ui/Toast'
import { motion } from 'framer-motion'
import { ClipboardList, Trash2, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

type Survey = {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  question_count: number
  participant_count: number
  participant_names: string[]
}

type FilterType = 'all' | 'draft' | 'active' | 'completed'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativas' },
  { value: 'completed', label: 'Concluídas' },
]

const statusConfig: Record<string, { badge: 'info' | 'success' | 'neutral'; label: string }> = {
  draft: { badge: 'neutral', label: 'Rascunho' },
  active: { badge: 'info', label: 'Ativa' },
  completed: { badge: 'success', label: 'Concluída' },
}

export function SurveyListClient({ refreshKey = 0 }: { refreshKey?: number }) {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('surveys')
      .select('*, survey_questions(id), survey_participants(id, participant_name)')
      .order('created_at', { ascending: false })

    if (data) {
      setSurveys(data.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        title: s.title as string,
        description: s.description as string | null,
        status: s.status as string,
        created_at: s.created_at as string,
        question_count: Array.isArray(s.survey_questions) ? s.survey_questions.length : 0,
        participant_count: Array.isArray(s.survey_participants) ? (s.survey_participants as Array<Record<string, unknown>>).length : 0,
        participant_names: Array.isArray(s.survey_participants) ? (s.survey_participants as Array<{ participant_name: string | null }>).map(p => p.participant_name || '').filter(Boolean) : [],
      })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSurveys() }, [fetchSurveys, refreshKey])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('surveys').delete().eq('id', deleteId)
    setDeleting(false)
    setDeleteId(null)
    toast.success('Enquete excluída!')
    fetchSurveys()
  }

  const filtered = surveys.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const matchTitle = s.title.toLowerCase().includes(q)
      const matchParticipant = s.participant_names.some(n => n.toLowerCase().includes(q))
      if (!matchTitle && !matchParticipant) return false
    }
    return true
  })

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <>
      {/* Search + Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título ou participante..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={cn('px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors', filter === f.value ? 'bg-accent text-text-on-accent' : 'bg-surface-2 text-text-secondary hover:bg-border')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">{search ? 'Nenhuma enquete encontrada' : 'Nenhuma enquete criada'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(survey => {
            const config = statusConfig[survey.status] ?? statusConfig.draft
            return (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedId(survey.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{survey.title}</p>
                    {survey.description && <p className="text-xs text-text-muted mt-0.5 truncate">{survey.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                      <span>{formatDate(survey.created_at)}</span>
                      <span>{survey.question_count} pergunta{survey.question_count !== 1 ? 's' : ''}</span>
                      <span>{survey.participant_count} participante{survey.participant_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.badge}>{config.label}</Badge>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(survey.id) }} className="p-1.5 text-text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <SurveyDetailModal
        surveyId={selectedId}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={fetchSurveys}
      />

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Enquete"
        message="Tem certeza? Todas perguntas e respostas serão perdidas."
        confirmLabel="Excluir"
        loading={deleting}
      />
    </>
  )
}
