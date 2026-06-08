"use client"

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, type EventFormData } from '@/lib/validations/event'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EVENT_TYPES } from '@/lib/utils/constants'
import { LocationPickerModal } from './LocationPickerModal'
import { Search, X, Users, Building2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Participant {
  id?: string
  hcp_id?: string
  hco_id?: string
  name: string
  type: 'hcp' | 'hco'
  pharmacists?: Array<{ name: string; crf: string }>
  hco_name?: string
}

interface EventFormProps {
  initialData?: {
    title?: string
    type?: string
    description?: string
    scheduled_at?: string
    location?: string
    budget?: string
    notes?: string
    participants?: Participant[]
  }
  onSubmit: (data: EventFormData, participants: Participant[]) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  submitLabel?: string
}

export function EventForm({ initialData, onSubmit, onCancel, loading, submitLabel = 'Agendar Evento' }: EventFormProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialData?.participants ?? [])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchType, setSearchType] = useState<'hcp' | 'hco'>('hcp')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      type: initialData?.type || '',
      description: initialData?.description || '',
      scheduled_at: initialData?.scheduled_at || '',
      location: initialData?.location || '',
      budget: initialData?.budget || '',
      notes: initialData?.notes || '',
    },
  })

  const selectedType = watch('type')
  const locationValue = watch('location')

  // Debounced search for HCPs/HCOs
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      const supabase = createClient()

      if (searchType === 'hcp') {
        const { data } = await supabase
          .from('hcps')
          .select('id, name')
          .eq('active', true)
          .ilike('name', `%${searchQuery}%`)
          .limit(5)

        if (data) {
          setSearchResults(data.map(h => ({ hcp_id: h.id, name: h.name, type: 'hcp' as const })))
          setShowResults(true)
        }
      } else {
        // Search HCOs by name AND search pharmacists by name
        const { data } = await supabase
          .from('hcos')
          .select('id, name, pharmacists')
          .limit(50)

        if (data) {
          const query = searchQuery.toLowerCase()
          const results: Participant[] = []
          
          for (const hco of data) {
            const pharms = (hco.pharmacists as Array<{ name: string; crf: string }>) || []
            if (pharms.length > 0) {
              for (const ph of pharms) {
                // Match if pharmacy name or pharmacist name contains query
                if (
                  hco.name.toLowerCase().includes(query) ||
                  ph.name.toLowerCase().includes(query)
                ) {
                  results.push({
                    hco_id: hco.id,
                    name: ph.name,
                    type: 'hco' as const,
                    pharmacists: [ph],
                    hco_name: hco.name,
                  })
                }
              }
            } else {
              // HCO without pharmacists — show pharmacy name if matches
              if (hco.name.toLowerCase().includes(query)) {
                results.push({
                  hco_id: hco.id,
                  name: hco.name,
                  type: 'hco' as const,
                  pharmacists: [],
                })
              }
            }
          }
          setSearchResults(results.slice(0, 8))
          setShowResults(results.length > 0)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchType])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addParticipant(participant: Participant) {
    const alreadyAdded = participants.some(
      p => {
        if (p.hcp_id && participant.hcp_id) return p.hcp_id === participant.hcp_id
        // For HCO pharmacists: same HCO + same pharmacist name = duplicate
        if (p.hco_id && participant.hco_id) return p.hco_id === participant.hco_id && p.name === participant.name
        return false
      }
    )
    if (!alreadyAdded) {
      setParticipants(prev => [...prev, participant])
    }
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  function removeParticipant(index: number) {
    setParticipants(prev => prev.filter((_, i) => i !== index))
  }

  function handleFormSubmit(data: EventFormData) {
    return onSubmit(data, participants)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Title */}
        <Input id="title" label="Título do Evento *" placeholder="Ex: Palestra sobre Hipertensão" error={errors.title?.message} {...register('title')} />

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Tipo de Evento *</label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('type', t.value, { shouldValidate: true })}
                className={cn(
                  'flex items-center justify-center px-2 py-2.5 rounded-lg border-2 text-xs font-medium transition-all',
                  selectedType === t.value
                    ? 'border-text-primary bg-surface-2 text-text-primary'
                    : 'border-border bg-surface text-text-muted hover:border-text-primary hover:text-text-primary'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('type')} />
          {errors.type && <p className="mt-1 text-xs text-danger">{errors.type.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-medium text-text-secondary mb-1.5">Descrição</label>
          <textarea id="description" rows={2} placeholder="Descreva o evento..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus resize-none" {...register('description')} />
        </div>

        {/* Date/Time */}
        <Input id="scheduled_at" label="Data e Hora *" type="datetime-local" error={errors.scheduled_at?.message} {...register('scheduled_at')} />

        {/* Location — button to open modal */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Local</label>
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
              locationValue
                ? 'border-accent-light-border bg-accent-light'
                : 'border-dashed border-border hover:border-accent hover:bg-surface-2'
            )}
          >
            <MapPin className={cn('w-5 h-5 shrink-0', locationValue ? 'text-accent' : 'text-text-muted')} />
            {locationValue ? (
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-primary block truncate">{locationValue}</span>
                <span className="text-[10px] text-accent">Toque para alterar</span>
              </div>
            ) : (
              <span className="text-sm text-text-muted">Selecionar local...</span>
            )}
            {locationValue && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setValue('location', '') }}
                className="text-text-muted hover:text-danger p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>
          <input type="hidden" {...register('location')} />
        </div>

        {/* Budget */}
        <Input id="budget" label="Orçamento (R$)" type="number" step="0.01" placeholder="0.00" {...register('budget')} />

        {/* Participants */}
        <div ref={dropdownRef}>
          <label className="block text-xs font-medium text-text-secondary mb-2">Participantes</label>

          {/* Type toggle */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setSearchType('hcp')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                searchType === 'hcp' ? 'bg-accent text-text-on-accent' : 'bg-surface-2 text-text-secondary'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              HCP
            </button>
            <button
              type="button"
              onClick={() => setSearchType('hco')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                searchType === 'hco' ? 'bg-accent text-text-on-accent' : 'bg-surface-2 text-text-secondary'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              HCO
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder={`Buscar ${searchType === 'hcp' ? 'médico' : 'farmacêutico'}...`}
              className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-md max-h-52 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addParticipant(result)}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-2 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-border last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      {result.type === 'hco'
                        ? <Building2 className="w-4 h-4 text-info shrink-0" />
                        : <Users className="w-4 h-4 text-accent shrink-0" />
                      }
                      <span className="text-sm font-medium text-text-primary">{result.name}</span>
                      {result.type === 'hco' && result.hco_name && (
                        <span className="text-xs text-text-muted ml-1">• {result.hco_name}</span>
                      )}
                    </div>
                    {result.type === 'hco' && result.pharmacists && result.pharmacists.length > 0 && !result.hco_name && (
                      <div className="ml-6 mt-1 flex flex-wrap gap-1">
                        {result.pharmacists.map((ph, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 bg-info-light text-info rounded-md border border-info-border">
                            {ph.name} • {ph.crf}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Participant list */}
          {participants.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
                    p.type === 'hcp'
                      ? 'bg-accent-light border-accent-light-border'
                      : 'bg-info-light border-info-border'
                  )}
                >
                  {p.type === 'hcp' ? <Users className="w-3.5 h-3.5 text-accent shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-info shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-text-primary block truncate">{p.name}</span>
                    {p.type === 'hco' && p.hco_name && (
                      <span className="text-[10px] text-text-muted">{p.hco_name}</span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeParticipant(i)} className="text-text-muted hover:text-danger shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs font-medium text-text-secondary mb-1.5">Observações</label>
          <textarea id="notes" rows={2} placeholder="Observações sobre o evento..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus resize-none" {...register('notes')} />
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full">
          {submitLabel}
        </Button>
      </form>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={(text) => setValue('location', text)}
        currentValue={locationValue}
      />
    </>
  )
}
