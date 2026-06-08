"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

const SATISFACTION_OPTIONS = [
  { value: 1, emoji: '😡', label: 'Péssimo', activeBorder: 'border-danger', activeBg: 'bg-danger-light text-danger' },
  { value: 2, emoji: '😞', label: 'Ruim', activeBorder: 'border-warning', activeBg: 'bg-warning-light text-warning' },
  { value: 3, emoji: '😐', label: 'Neutro', activeBorder: 'border-neutral', activeBg: 'bg-neutral-light text-neutral' },
  { value: 4, emoji: '😊', label: 'Bom', activeBorder: 'border-info', activeBg: 'bg-info-light text-info' },
  { value: 5, emoji: '🤩', label: 'Excelente', activeBorder: 'border-success', activeBg: 'bg-success-light text-success' },
]

interface Question { id: string; question_text: string; question_type: 'yes_no' | 'paragraph' | 'satisfaction'; position: number }
interface Participant { id: string; participant_name: string | null; completed: boolean }

export function SurveyLiveMode({ surveyId }: { surveyId: string }) {
  const { toast } = useToast()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPIdx, setCurrentPIdx] = useState(0)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { bool?: boolean; text?: string; number?: number }>>({})
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const [q, p] = await Promise.all([
        supabase.from('survey_questions').select('*').eq('survey_id', surveyId).order('position'),
        supabase.from('survey_participants').select('*').eq('survey_id', surveyId),
      ])
      if (q.data) setQuestions(q.data as Question[])
      if (p.data) {
        const parts = p.data as Participant[]
        setParticipants(parts)
        // Start from first uncompleted
        const firstUncompleted = parts.findIndex(x => !x.completed)
        if (firstUncompleted >= 0) setCurrentPIdx(firstUncompleted)
      }
      // Mark survey as active
      await supabase.from('surveys').update({ status: 'active' }).eq('id', surveyId)
      setLoading(false)
    }
    fetch()
  }, [surveyId])

  const participant = participants[currentPIdx]
  const question = questions[currentQIdx]
  const answerKey = participant && question ? `${participant.id}-${question.id}` : ''
  const currentAnswer = answers[answerKey]

  function setAnswer(value: { bool?: boolean; text?: string; number?: number }) {
    setAnswers(prev => ({ ...prev, [answerKey]: value }))
  }

  async function finishParticipant() {
    if (!participant) return
    setSaving(true)
    const supabase = createClient()

    // Save responses
    const rows = questions.map(q => {
      const key = `${participant.id}-${q.id}`
      const ans = answers[key]
      return {
        survey_id: surveyId,
        participant_id: participant.id,
        question_id: q.id,
        answer_bool: ans?.bool ?? null,
        answer_text: ans?.text ?? null,
        answer_number: ans?.number ?? null,
      }
    }).filter(r => r.answer_bool !== null || (r.answer_text !== null && r.answer_text !== '') || r.answer_number !== null)

    if (rows.length > 0) {
      await supabase.from('survey_responses').insert(rows)
    }

    await supabase.from('survey_participants').update({ completed: true }).eq('id', participant.id)

    toast.success(`Respostas de ${participant.participant_name} salvas!`)

    const nextIdx = currentPIdx + 1
    if (nextIdx < participants.length) {
      setCurrentPIdx(nextIdx)
      setCurrentQIdx(0)
    } else {
      await supabase.from('surveys').update({ status: 'completed' }).eq('id', surveyId)
      setFinished(true)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-border" />
          <div className="absolute inset-0 rounded-full border-[3px] border-brand-green border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success-light border-2 border-success flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Enquete Concluída!</h2>
          <p className="text-sm text-text-secondary">Todas respostas registradas.</p>
          <Button onClick={() => router.push('/surveys')}>Voltar às Enquetes</Button>
        </div>
      </div>
    )
  }

  if (!participant || !question) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <p className="text-text-muted">Erro: sem dados</p>
        <Button onClick={() => router.push('/surveys')} className="mt-4">Voltar</Button>
      </div>
    )
  }

  const isLastQ = currentQIdx === questions.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={() => router.push('/surveys')} className="text-sm text-text-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs text-text-muted">Participante {currentPIdx + 1}/{participants.length}</p>
          <p className="text-sm font-semibold text-text-primary">{participant.participant_name}</p>
        </div>
        <div className="text-xs text-text-muted">{currentQIdx + 1}/{questions.length}</div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-border">
        <div className="h-full bg-brand-green transition-all duration-300" style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div key={answerKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-lg text-center space-y-8">
            <h2 className="text-2xl font-bold text-text-primary leading-tight">{question.question_text}</h2>

            {question.question_type === 'yes_no' ? (
              <div className="flex gap-4 justify-center">
                <button onClick={() => setAnswer({ bool: true })} className={cn('w-32 h-32 rounded-2xl border-3 flex flex-col items-center justify-center gap-2 text-lg font-bold transition-all', currentAnswer?.bool === true ? 'border-success bg-success-light text-success scale-105' : 'border-border bg-surface text-text-secondary hover:border-success hover:scale-105')}>
                  <Check className="w-8 h-8" /> Sim
                </button>
                <button onClick={() => setAnswer({ bool: false })} className={cn('w-32 h-32 rounded-2xl border-3 flex flex-col items-center justify-center gap-2 text-lg font-bold transition-all', currentAnswer?.bool === false ? 'border-danger bg-danger-light text-danger scale-105' : 'border-border bg-surface text-text-secondary hover:border-danger hover:scale-105')}>
                  <X className="w-8 h-8" /> Não
                </button>
              </div>
            ) : question.question_type === 'satisfaction' ? (
              <div className="flex gap-3 justify-center flex-wrap">
                {SATISFACTION_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setAnswer({ number: opt.value })} className={cn('w-20 h-24 rounded-2xl border-3 flex flex-col items-center justify-center gap-1.5 transition-all', currentAnswer?.number === opt.value ? `${opt.activeBorder} ${opt.activeBg} scale-110` : 'border-border bg-surface text-text-secondary hover:scale-105')}>
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[10px] font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea value={currentAnswer?.text || ''} onChange={e => setAnswer({ text: e.target.value })} rows={4} placeholder="Digite a resposta..." className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none resize-none" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-5 border-t border-border">
        <button onClick={() => setCurrentQIdx(p => Math.max(0, p - 1))} disabled={currentQIdx === 0} className="flex items-center gap-1 text-sm text-text-secondary disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        {isLastQ ? (
          <Button onClick={finishParticipant} loading={saving}>Finalizar</Button>
        ) : (
          <button onClick={() => setCurrentQIdx(p => p + 1)} className="flex items-center gap-1 text-sm font-medium text-accent">
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
