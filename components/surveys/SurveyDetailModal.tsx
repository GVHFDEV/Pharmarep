'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatters'
import { Play, Users, ChevronUp, ChevronDown, Pencil, Trash2, Plus, Eye, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SurveyResultsModal } from './SurveyResultsModal'

interface Question { id: string; question_text: string; question_type: 'yes_no' | 'paragraph' | 'satisfaction'; position: number }
interface Participant { id: string; hcp_id: string | null; hco_id: string | null; participant_name: string | null; completed: boolean }
interface SurveyData { id: string; title: string; description: string | null; status: string; created_at: string }

interface Props {
  surveyId: string | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export function SurveyDetailModal({ surveyId, open, onClose, onUpdated }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState<'yes_no' | 'paragraph' | 'satisfaction'>('yes_no')
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!open || !surveyId) { setSurvey(null); return }
    fetchAll()
  }, [open, surveyId])

  async function fetchAll() {
    if (!surveyId) return
    setLoading(true)
    const supabase = createClient()
    const [s, q, p] = await Promise.all([
      supabase.from('surveys').select('*').eq('id', surveyId).single(),
      supabase.from('survey_questions').select('*').eq('survey_id', surveyId).order('position'),
      supabase.from('survey_participants').select('*').eq('survey_id', surveyId),
    ])
    if (s.data) setSurvey(s.data as SurveyData)
    if (q.data) setQuestions(q.data as Question[])
    if (p.data) setParticipants(p.data as Participant[])
    setLoading(false)
  }

  async function addQuestion() {
    if (!newText.trim() || !surveyId) return
    const supabase = createClient()
    const { error } = await supabase.from('survey_questions').insert({ survey_id: surveyId, question_text: newText.trim(), question_type: newType, position: questions.length })
    if (!error) { setNewText(''); fetchAll() }
  }

  async function removeQuestion(id: string) {
    const supabase = createClient()
    await supabase.from('survey_questions').delete().eq('id', id)
    fetchAll()
  }

  async function saveEdit(id: string) {
    const supabase = createClient()
    await supabase.from('survey_questions').update({ question_text: editText }).eq('id', id)
    setEditIdx(null)
    fetchAll()
  }

  async function moveQuestion(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= questions.length) return
    const supabase = createClient()
    await Promise.all([
      supabase.from('survey_questions').update({ position: newIdx }).eq('id', questions[idx].id),
      supabase.from('survey_questions').update({ position: idx }).eq('id', questions[newIdx].id),
    ])
    fetchAll()
  }

  function handleStart() {
    if (questions.length === 0) { toast.error('Adicione perguntas antes.'); return }
    if (participants.length === 0) { toast.error('Adicione participantes antes.'); return }
    router.push(`/surveys/${surveyId}/live`)
    onClose()
  }

  if (!open) return null

  const statusLabels: Record<string, { badge: 'info' | 'success' | 'neutral'; label: string }> = {
    draft: { badge: 'neutral', label: 'Rascunho' },
    active: { badge: 'info', label: 'Ativa' },
    completed: { badge: 'success', label: 'Concluída' },
  }

  return (
    <>
      <ResponsiveModal open={open && !showResults} onClose={onClose} title={survey?.title || 'Enquete'} size="md" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-8 h-8"><div className="absolute inset-0 rounded-full border-[3px] border-border" /><div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" /></div>
          </div>
        ) : survey && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={statusLabels[survey.status]?.badge ?? 'neutral'}>{statusLabels[survey.status]?.label ?? survey.status}</Badge>
              <span className="text-xs text-text-muted">{formatDate(survey.created_at)}</span>
              <span className="text-xs text-text-muted">· {participants.length} participantes</span>
            </div>

            {survey.description && <p className="text-sm text-text-secondary">{survey.description}</p>}

            {/* Actions */}
            <div className="flex gap-2">
              {(survey.status === 'draft' || survey.status === 'active') && (
                <Button onClick={handleStart} className="flex items-center gap-2 flex-1">
                  <Play className="w-4 h-4" /> {survey.status === 'draft' ? 'Iniciar' : 'Continuar'}
                </Button>
              )}
              {(survey.status === 'active' || survey.status === 'completed') && (
                <Button variant="secondary" onClick={() => setShowResults(true)} className="flex items-center gap-2 flex-1">
                  <Eye className="w-4 h-4" /> Resultados
                </Button>
              )}
            </div>

            {/* Questions */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Perguntas ({questions.length})</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg">
                    <span className="text-xs font-bold text-text-muted w-5">{i + 1}</span>
                    {editIdx === i ? (
                      <div className="flex-1 flex gap-2">
                        <input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(q.id)} className="flex-1 rounded border border-border px-2 py-1 text-sm focus:outline-none focus:border-border-focus" />
                        <button onClick={() => saveEdit(q.id)} className="text-xs text-accent font-medium">OK</button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{q.question_text}</p>
                        <span className="text-[10px] text-text-muted">{q.question_type === 'yes_no' ? 'Sim/Não' : q.question_type === 'satisfaction' ? 'Satisfação' : 'Parágrafo'}</span>
                      </div>
                    )}
                    {survey.status === 'draft' && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1} className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setEditIdx(i); setEditText(q.question_text) }} className="p-0.5 text-text-muted hover:text-accent"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => removeQuestion(q.id)} className="p-0.5 text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {survey.status === 'draft' && (
                <div className="mt-2 flex gap-2">
                  <div className="flex gap-1">
                    <button onClick={() => setNewType('yes_no')} className={cn('px-2 py-1 text-[10px] font-medium rounded-full', newType === 'yes_no' ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted border border-border')}>S/N</button>
                    <button onClick={() => setNewType('paragraph')} className={cn('px-2 py-1 text-[10px] font-medium rounded-full', newType === 'paragraph' ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted border border-border')}>¶</button>
                    <button onClick={() => setNewType('satisfaction')} className={cn('px-2 py-1 text-[10px] font-medium rounded-full', newType === 'satisfaction' ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted border border-border')}>😊</button>
                  </div>
                  <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQuestion()} placeholder="Nova pergunta..." className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm focus:outline-none focus:border-border-focus" />
                  <button onClick={addQuestion} className="p-1.5 bg-accent text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {/* Participants */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Participantes</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {participants.map(p => (
                  <div key={p.id} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs', p.completed ? 'bg-success-light border-success-border' : 'bg-surface border-border')}>
                    {p.hcp_id ? <Users className="w-3 h-3 text-accent" /> : <Building2 className="w-3 h-3 text-info" />}
                    <span className="text-text-primary">{p.participant_name}</span>
                    {p.completed && <Badge variant="success" className="ml-auto">✓</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {showResults && surveyId && (
        <SurveyResultsModal
          surveyId={surveyId}
          open={showResults}
          onClose={() => setShowResults(false)}
          questions={questions}
          participants={participants}
        />
      )}
    </>
  )
}
