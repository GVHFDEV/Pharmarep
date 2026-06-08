'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'
import { Plus, Trash2, GripVertical, Search, Users, Building2, X, ChevronUp, ChevronDown, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Question {
  id?: string
  question_text: string
  question_type: 'yes_no' | 'paragraph' | 'satisfaction'
  position: number
}

interface Participant {
  hcp_id?: string
  hco_id?: string
  name: string
  hco_name?: string
}

interface SurveyCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function SurveyCreateModal({ open, onClose, onCreated }: SurveyCreateModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  // Step 1 — info
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Step 2 — participants
  const [participants, setParticipants] = useState<Participant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'hcp' | 'hco'>('hcp')
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Step 3 — questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState<'yes_no' | 'paragraph' | 'satisfaction'>('yes_no')

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1)
      setTitle('')
      setDescription('')
      setParticipants([])
      setQuestions([])
      setSearchQuery('')
    }
  }, [open])

  // Search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const supabase = createClient()
      if (searchType === 'hcp') {
        const { data } = await supabase.from('hcps').select('id, name').eq('active', true).ilike('name', `%${searchQuery}%`).limit(5)
        if (data) { setSearchResults(data.map(h => ({ hcp_id: h.id, name: h.name }))); setShowSearch(true) }
      } else {
        const { data } = await supabase.from('hcos').select('id, name, pharmacists').limit(50)
        if (data) {
          const results: Participant[] = []
          const q = searchQuery.toLowerCase()
          for (const hco of data) {
            const pharms = (hco.pharmacists as Array<{ name: string; crf: string }>) || []
            for (const ph of pharms) {
              if (ph.name.toLowerCase().includes(q) || hco.name.toLowerCase().includes(q)) {
                results.push({ hco_id: hco.id, name: ph.name, hco_name: hco.name })
              }
            }
          }
          setSearchResults(results.slice(0, 8))
          setShowSearch(true)
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchType])

  function addParticipant(p: Participant) {
    const dup = participants.some(x => {
      if (x.hcp_id && p.hcp_id) return x.hcp_id === p.hcp_id
      if (x.hco_id && p.hco_id) return x.hco_id === p.hco_id && x.name === p.name
      return false
    })
    if (!dup) setParticipants(prev => [...prev, p])
    setSearchQuery('')
    setSearchResults([])
    setShowSearch(false)
  }

  function addQuestion() {
    if (!newText.trim()) return
    setQuestions(prev => [...prev, { question_text: newText.trim(), question_type: newType, position: prev.length }])
    setNewText('')
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, position: i })))
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= questions.length) return
    const arr = [...questions]
    const temp = arr[idx]
    arr[idx] = arr[newIdx]
    arr[newIdx] = temp
    setQuestions(arr.map((q, i) => ({ ...q, position: i })))
  }

  function startEdit(idx: number) {
    setEditIdx(idx)
    setEditText(questions[idx].question_text)
  }

  function saveEdit() {
    if (editIdx === null) return
    setQuestions(prev => prev.map((q, i) => i === editIdx ? { ...q, question_text: editText } : q))
    setEditIdx(null)
    setEditText('')
  }

  function toggleType(idx: number) {
    const cycle = { yes_no: 'paragraph' as const, paragraph: 'satisfaction' as const, satisfaction: 'yes_no' as const }
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, question_type: cycle[q.question_type] } : q))
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Título obrigatório'); setStep(1); return }
    if (questions.length === 0) { toast.error('Adicione ao menos 1 pergunta'); setStep(3); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sessão expirada'); setLoading(false); return }
    await ensureProfile(supabase, user)

    // Create survey
    const { data: survey, error } = await supabase.from('surveys').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      status: 'draft',
    }).select('id').single()

    if (error || !survey) { toast.error('Erro ao criar enquete.'); setLoading(false); return }

    // Insert questions
    const qRows = questions.map((q, i) => ({
      survey_id: survey.id,
      question_text: q.question_text,
      question_type: q.question_type,
      position: i,
    }))
    await supabase.from('survey_questions').insert(qRows)

    // Insert participants
    if (participants.length > 0) {
      const pRows = participants.map(p => ({
        survey_id: survey.id,
        hcp_id: p.hcp_id || null,
        hco_id: p.hco_id || null,
        participant_name: p.name,
      }))
      await supabase.from('survey_participants').insert(pRows)
    }

    setLoading(false)
    toast.success('Enquete criada!')
    onCreated()
    onClose()
  }

  const stepTitle = step === 1 ? 'Nova Enquete' : step === 2 ? 'Participantes' : 'Perguntas'

  return (
    <ResponsiveModal open={open} onClose={onClose} title={stepTitle} size="md" scrollable>
      <div className="space-y-5">
        {/* Step indicators */}
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn('flex-1 h-1 rounded-full transition-colors', s <= step ? 'bg-brand-green' : 'bg-border')} />
          ))}
        </div>

        {/* Step 1 — Info */}
        {step === 1 && (
          <div className="space-y-4">
            <Input id="s-title" label="Título *" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Satisfação com produto X" />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Descrição opcional..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus resize-none" />
            </div>
            <Button onClick={() => { if (!title.trim()) { toast.error('Título obrigatório'); return }; setStep(2) }} className="w-full">Próximo</Button>
          </div>
        )}

        {/* Step 2 — Participants */}
        {step === 2 && (
          <div className="space-y-4" ref={searchRef}>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSearchType('hcp')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors', searchType === 'hcp' ? 'bg-accent text-text-on-accent' : 'bg-surface-2 text-text-secondary')}>
                <Users className="w-3.5 h-3.5" /> HCP
              </button>
              <button type="button" onClick={() => setSearchType('hco')} className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors', searchType === 'hco' ? 'bg-accent text-text-on-accent' : 'bg-surface-2 text-text-secondary')}>
                <Building2 className="w-3.5 h-3.5" /> Farmacêutico
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`Buscar ${searchType === 'hcp' ? 'médico' : 'farmacêutico'}...`} className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus" />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <button key={i} type="button" onClick={() => addParticipant(r)} className="w-full text-left px-3 py-2.5 hover:bg-surface-2 border-b border-border last:border-b-0">
                      <span className="text-sm font-medium text-text-primary">{r.name}</span>
                      {r.hco_name && <span className="text-xs text-text-muted ml-2">· {r.hco_name}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm">
                    {p.hcp_id ? <Users className="w-3.5 h-3.5 text-accent shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-info shrink-0" />}
                    <span className="flex-1 truncate text-text-primary">{p.name}</span>
                    {p.hco_name && <span className="text-[10px] text-text-muted">{p.hco_name}</span>}
                    <button onClick={() => setParticipants(prev => prev.filter((_, j) => j !== i))} className="text-text-muted hover:text-danger"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Próximo</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Questions */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Question list */}
            {questions.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-xl">
                    <span className="text-xs font-bold text-text-muted w-5">{i + 1}</span>
                    {editIdx === i ? (
                      <div className="flex-1 flex gap-2">
                        <input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} className="flex-1 rounded-lg border border-border px-2 py-1 text-sm focus:outline-none focus:border-border-focus" />
                        <button onClick={saveEdit} className="text-xs text-accent font-medium">OK</button>
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{q.question_text}</p>
                        <button onClick={() => toggleType(i)} className="text-[10px] text-text-muted hover:text-accent">{q.question_type === 'yes_no' ? 'Sim/Não' : q.question_type === 'satisfaction' ? 'Satisfação' : 'Parágrafo'}</button>
                      </div>
                    )}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => moveQuestion(i, -1)} disabled={i === 0} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                      <button onClick={() => startEdit(i)} className="p-1 text-text-muted hover:text-accent"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeQuestion(i)} className="p-1 text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add question */}
            <div className="border border-border rounded-xl p-3 bg-surface-2 space-y-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewType('yes_no')} className={cn('px-3 py-1 text-xs font-medium rounded-full', newType === 'yes_no' ? 'bg-accent text-text-on-accent' : 'bg-surface text-text-secondary border border-border')}>Sim/Não</button>
                <button type="button" onClick={() => setNewType('paragraph')} className={cn('px-3 py-1 text-xs font-medium rounded-full', newType === 'paragraph' ? 'bg-accent text-text-on-accent' : 'bg-surface text-text-secondary border border-border')}>Parágrafo</button>
                <button type="button" onClick={() => setNewType('satisfaction')} className={cn('px-3 py-1 text-xs font-medium rounded-full', newType === 'satisfaction' ? 'bg-accent text-text-on-accent' : 'bg-surface text-text-secondary border border-border')}>Satisfação</button>
              </div>
              <div className="flex gap-2">
                <input value={newText} onChange={e => setNewText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQuestion()} placeholder="Digite a pergunta..." className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-border-focus focus:outline-none" />
                <Button onClick={addQuestion} size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
              <Button onClick={handleSave} loading={loading} className="flex-1">Salvar Enquete</Button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  )
}
