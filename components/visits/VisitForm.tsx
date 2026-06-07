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
import { Search, Users, Monitor, Phone, Mail, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// WhatsApp SVG icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// Map channel values to icons
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  presencial: <Users className="w-5 h-5" />,
  virtual: <Monitor className="w-5 h-5" />,
  telefone: <Phone className="w-5 h-5" />,
  whatsapp: <WhatsAppIcon className="w-5 h-5" />,
  email: <Mail className="w-5 h-5" />,
  outros: <MoreHorizontal className="w-5 h-5" />,
}

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
                'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border-2 text-xs font-medium transition-all',
                channel === ch.value
                  ? 'border-text-primary bg-surface-2 text-text-primary'
                  : 'border-border bg-surface text-text-muted hover:border-text-primary hover:text-text-primary'
              )}
            >
              <span className="text-text-primary">{CHANNEL_ICONS[ch.value]}</span>
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
