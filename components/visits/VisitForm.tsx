"use client"

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitSchema, type VisitFormData } from '@/lib/validations/visit'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { VISIT_CHANNELS } from '@/lib/utils/constants'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface HcpOption {
  id: string
  name: string
  specialty: string
  clinic_name: string | null
  clinic_address: string | null
  clinic_city: string | null
}

interface VisitFormProps {
  preselectedHcp?: { id: string; name: string } | null
  onSubmit: (data: VisitFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function VisitForm({ preselectedHcp, onSubmit, onCancel, loading }: VisitFormProps) {
  const [hcpSearch, setHcpSearch] = useState('')
  const [hcpResults, setHcpResults] = useState<HcpOption[]>([])
  const [selectedHcp, setSelectedHcp] = useState<HcpOption | null>(null)
  const [showResults, setShowResults] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      hcp_id: preselectedHcp?.id || '',
      scheduled_at: '',
      channel: '',
      location: '',
      notes: '',
    },
  })

  const scheduledAt = watch('scheduled_at')
  const channel = watch('channel')
  const isPastDate = scheduledAt ? new Date(scheduledAt) < new Date() : false

  // Set preselected HCP value in form
  useEffect(() => {
    if (preselectedHcp) {
      setSelectedHcp({ id: preselectedHcp.id, name: preselectedHcp.name, specialty: '', clinic_name: null, clinic_address: null, clinic_city: null })
      setValue('hcp_id', preselectedHcp.id)
    }
  }, [preselectedHcp, setValue])

  // Auto-fill location when presencial selected and HCP has clinic
  useEffect(() => {
    if (channel === 'presencial' && selectedHcp) {
      const parts = [selectedHcp.clinic_name, selectedHcp.clinic_address, selectedHcp.clinic_city].filter(Boolean)
      if (parts.length > 0) {
        setValue('location', parts.join(' – '))
      }
    }
  }, [channel, selectedHcp, setValue])

  // Debounced HCP search
  useEffect(() => {
    if (!hcpSearch || hcpSearch.length < 2) {
      setHcpResults([])
      return
    }

    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('hcps')
        .select('id, name, specialty, clinic_name, clinic_address, clinic_city')
        .eq('active', true)
        .ilike('name', `%${hcpSearch}%`)
        .limit(5)

      if (data) {
        setHcpResults(data)
        setShowResults(true)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [hcpSearch])

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

  function handleSelectHcp(hcp: HcpOption) {
    setSelectedHcp(hcp)
    setValue('hcp_id', hcp.id)
    setHcpSearch('')
    setHcpResults([])
    setShowResults(false)
  }

  function handleClearHcp() {
    setSelectedHcp(null)
    setValue('hcp_id', '')
    setValue('location', '')
    setHcpSearch('')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* HCP Autocomplete */}
      <div className="w-full" ref={dropdownRef}>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">Médico *</label>
        {selectedHcp ? (
          <div className="flex items-center gap-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary">
            <span className="flex-1">{selectedHcp.name}</span>
            <button type="button" onClick={handleClearHcp} className="text-text-muted hover:text-text-primary text-xs">Alterar</button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={hcpSearch}
              onChange={(e) => setHcpSearch(e.target.value)}
              onFocus={() => hcpResults.length > 0 && setShowResults(true)}
              placeholder="Buscar médico por nome..."
              className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
            />
            {showResults && hcpResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-md max-h-48 overflow-y-auto">
                {hcpResults.map((hcp) => (
                  <button key={hcp.id} type="button" onClick={() => handleSelectHcp(hcp)} className="w-full text-left px-3 py-2 hover:bg-surface-2 transition-colors first:rounded-t-lg last:rounded-b-lg">
                    <span className="text-sm font-medium text-text-primary">{hcp.name}</span>
                    <span className="text-xs text-text-secondary ml-2">{hcp.specialty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <input type="hidden" {...register('hcp_id')} />
        {errors.hcp_id && <p className="mt-1 text-xs text-danger">{errors.hcp_id.message}</p>}
      </div>

      {/* Channel (type of contact) */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">Tipo de Contato *</label>
        <div className="grid grid-cols-3 gap-2">
          {VISIT_CHANNELS.map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => setValue('channel', ch.value, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border-2 text-xs font-medium transition-all',
                channel === ch.value
                  ? 'border-accent bg-accent-light text-accent'
                  : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
              )}
            >
              <span className="text-base">{ch.emoji}</span>
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('channel')} />
        {errors.channel && <p className="mt-1 text-xs text-danger">{errors.channel.message}</p>}
      </div>

      {/* Date/Time */}
      <div className="w-full">
        <Input id="scheduled_at" label="Data e Hora *" type="datetime-local" error={errors.scheduled_at?.message} {...register('scheduled_at')} />
        {isPastDate && <div className="mt-2"><Badge variant="warning">Data no passado</Badge></div>}
      </div>

      {/* Location - auto-filled for presencial */}
      <div>
        <Input id="location" label="Local" placeholder={channel === 'presencial' ? 'Preenchido automaticamente' : 'Ex: Consultório, Hospital...'} {...register('location')} />
        {channel === 'presencial' && selectedHcp?.clinic_name && (
          <p className="mt-1 text-xs text-accent">📍 Preenchido com clínica do HCP</p>
        )}
      </div>

      {/* Notes */}
      <div className="w-full">
        <label htmlFor="notes" className="block text-xs font-medium text-text-secondary mb-1.5">Observações</label>
        <textarea id="notes" rows={3} placeholder="Observações sobre a visita..." className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus resize-none" {...register('notes')} />
      </div>

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full">
        Agendar Visita
      </Button>
    </form>
  )
}
