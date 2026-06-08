'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Badge } from '@/components/ui/Badge'
import { Check, X, Users, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Question { id: string; question_text: string; question_type: 'yes_no' | 'paragraph' | 'satisfaction'; position: number }
interface Participant { id: string; hcp_id: string | null; hco_id: string | null; participant_name: string | null; completed: boolean }
interface Response { participant_id: string; question_id: string; answer_bool: boolean | null; answer_text: string | null; answer_number: number | null }

interface Props {
  surveyId: string
  open: boolean
  onClose: () => void
  questions: Question[]
  participants: Participant[]
}

export function SurveyResultsModal({ surveyId, open, onClose, questions, participants }: Props) {
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'summary' | 'individual'>('summary')
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase.from('survey_responses').select('participant_id, question_id, answer_bool, answer_text, answer_number').eq('survey_id', surveyId)
      if (data) setResponses(data)
      setLoading(false)
    }
    fetch()
  }, [open, surveyId])

  const completedP = participants.filter(p => p.completed)

  function getParticipantResponses(participantId: string) {
    return responses.filter(r => r.participant_id === participantId)
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Resultados da Enquete" size="md" scrollable>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-8 h-8"><div className="absolute inset-0 rounded-full border-[3px] border-border" /><div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" /></div>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">{completedP.length}/{participants.length} responderam</p>

          {/* View toggle */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
            <button onClick={() => { setView('summary'); setSelectedParticipant(null) }} className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all', view === 'summary' ? 'bg-surface text-accent shadow-sm' : 'text-text-muted')}>Resumo</button>
            <button onClick={() => setView('individual')} className={cn('flex-1 py-1.5 rounded-lg text-xs font-medium transition-all', view === 'individual' ? 'bg-surface text-accent shadow-sm' : 'text-text-muted')}>Por Participante</button>
          </div>

          {view === 'summary' ? (
            <div className="space-y-4">
              {questions.map(q => {
                const qR = responses.filter(r => r.question_id === q.id)
                if (q.question_type === 'yes_no') {
                  const yes = qR.filter(r => r.answer_bool === true).length
                  const no = qR.filter(r => r.answer_bool === false).length
                  const total = yes + no
                  const pct = total > 0 ? Math.round((yes / total) * 100) : 0
                  return (
                    <div key={q.id} className="bg-surface border border-border rounded-xl p-4">
                      <p className="text-sm font-medium text-text-primary mb-3">{q.question_text}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-14"><Check className="w-4 h-4 text-success" /><span className="text-sm font-medium">{yes}</span></div>
                          <div className="flex-1 h-5 bg-border/30 rounded-full overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} /></div>
                          <span className="text-xs text-text-muted w-10 text-right">{pct}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-14"><X className="w-4 h-4 text-danger" /><span className="text-sm font-medium">{no}</span></div>
                          <div className="flex-1 h-5 bg-border/30 rounded-full overflow-hidden"><div className="h-full bg-danger rounded-full" style={{ width: `${100 - pct}%` }} /></div>
                          <span className="text-xs text-text-muted w-10 text-right">{100 - pct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                if (q.question_type === 'satisfaction') {
                  const SAT_OPTS = [
                    { value: 1, emoji: '😡', label: 'Péssimo' },
                    { value: 2, emoji: '😞', label: 'Ruim' },
                    { value: 3, emoji: '😐', label: 'Neutro' },
                    { value: 4, emoji: '😊', label: 'Bom' },
                    { value: 5, emoji: '🤩', label: 'Excelente' },
                  ]
                  const total = qR.filter(r => r.answer_number != null).length
                  const avg = total > 0 ? qR.reduce((s, r) => s + (r.answer_number || 0), 0) / total : 0
                  return (
                    <div key={q.id} className="bg-surface border border-border rounded-xl p-4">
                      <p className="text-sm font-medium text-text-primary mb-3">{q.question_text}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{avg >= 4.5 ? '🤩' : avg >= 3.5 ? '😊' : avg >= 2.5 ? '😐' : avg >= 1.5 ? '😞' : '😡'}</span>
                        <span className="text-lg font-bold text-text-primary">{avg.toFixed(1)}</span>
                        <span className="text-xs text-text-muted">/ 5 ({total} respostas)</span>
                      </div>
                      <div className="space-y-1">
                        {SAT_OPTS.map(opt => {
                          const count = qR.filter(r => r.answer_number === opt.value).length
                          const pctOpt = total > 0 ? Math.round((count / total) * 100) : 0
                          return (
                            <div key={opt.value} className="flex items-center gap-2">
                              <span className="text-sm w-6">{opt.emoji}</span>
                              <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-green rounded-full transition-all" style={{ width: `${pctOpt}%` }} />
                              </div>
                              <span className="text-[10px] text-text-muted w-8 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                // paragraph
                return (
                  <div key={q.id} className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-sm font-medium text-text-primary mb-3">{q.question_text}</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {qR.filter(r => r.answer_text).map((r, i) => {
                        const p = participants.find(x => x.id === r.participant_id)
                        return (
                          <div key={i} className="px-3 py-2 bg-surface-2 rounded-lg border border-border">
                            <p className="text-[10px] font-medium text-text-muted">{p?.participant_name || 'Participante'}</p>
                            <p className="text-sm text-text-primary">{r.answer_text}</p>
                          </div>
                        )
                      })}
                      {qR.filter(r => r.answer_text).length === 0 && <p className="text-xs text-text-muted italic">Sem respostas</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Participant selector */}
              {!selectedParticipant ? (
                <div className="space-y-1.5">
                  {completedP.map(p => (
                    <button key={p.id} onClick={() => setSelectedParticipant(p.id)} className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors text-left">
                      {p.hcp_id ? <Users className="w-4 h-4 text-accent" /> : <Building2 className="w-4 h-4 text-info" />}
                      <span className="text-sm font-medium text-text-primary">{p.participant_name}</span>
                      <Badge variant="success" className="ml-auto">✓</Badge>
                    </button>
                  ))}
                  {completedP.length === 0 && <p className="text-sm text-text-muted text-center py-4">Nenhum participante respondeu ainda</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setSelectedParticipant(null)} className="text-xs text-accent hover:underline">← Voltar</button>
                  <p className="text-sm font-semibold text-text-primary">{participants.find(p => p.id === selectedParticipant)?.participant_name}</p>
                  {questions.map(q => {
                    const r = responses.find(x => x.participant_id === selectedParticipant && x.question_id === q.id)
                    return (
                      <div key={q.id} className="bg-surface border border-border rounded-lg p-3">
                        <p className="text-xs text-text-muted mb-1">{q.question_text}</p>
                        {q.question_type === 'yes_no' ? (
                          r?.answer_bool != null ? (
                            <Badge variant={r.answer_bool ? 'success' : 'neutral'}>{r.answer_bool ? 'Sim' : 'Não'}</Badge>
                          ) : <span className="text-xs text-text-muted italic">Não respondeu</span>
                        ) : q.question_type === 'satisfaction' ? (
                          r?.answer_number != null ? (
                            <span className="text-lg">{['', '😡', '😞', '😐', '😊', '🤩'][r.answer_number]} <span className="text-sm text-text-secondary">{['', 'Péssimo', 'Ruim', 'Neutro', 'Bom', 'Excelente'][r.answer_number]}</span></span>
                          ) : <span className="text-xs text-text-muted italic">Não respondeu</span>
                        ) : (
                          <p className="text-sm text-text-primary">{r?.answer_text || <span className="text-xs text-text-muted italic">Não respondeu</span>}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ResponsiveModal>
  )
}
