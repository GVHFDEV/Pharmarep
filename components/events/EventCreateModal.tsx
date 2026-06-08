'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EventForm } from '@/components/events/EventForm'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { type EventFormData } from '@/lib/validations/event'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'

interface Participant {
  hcp_id?: string
  hco_id?: string
  name: string
  type: 'hcp' | 'hco'
}

interface EventCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function EventCreateModal({ open, onClose, onCreated }: EventCreateModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: EventFormData, participants: Participant[]) {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sessão expirada')
      setLoading(false)
      return
    }

    await ensureProfile(supabase, user)

    const { data: event, error } = await supabase.from('events').insert({
      user_id: user.id,
      title: data.title,
      type: data.type,
      description: data.description || null,
      scheduled_at: data.scheduled_at,
      location: data.location || null,
      budget: data.budget ? parseFloat(data.budget) : null,
      notes: data.notes || null,
      status: 'scheduled',
    }).select('id').single()

    if (error || !event) {
      toast.error('Erro ao criar evento. Tente novamente.')
      setLoading(false)
      return
    }

    // Insert participants
    if (participants.length > 0) {
      const participantRows = participants.map(p => ({
        event_id: event.id,
        hcp_id: p.hcp_id || null,
        hco_id: p.hco_id || null,
        participant_name: p.name || null,
      }))

      const { error: pError } = await supabase.from('event_participants').insert(participantRows)
      if (pError) {
        toast.error('Evento criado, mas erro ao adicionar participantes.')
        setLoading(false)
        onCreated()
        onClose()
        return
      }
    }

    setLoading(false)
    toast.success('Evento agendado com sucesso!')
    onCreated()
    onClose()
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Novo Evento" size="md" scrollable>
      <EventForm onSubmit={handleSubmit} loading={loading} />
    </ResponsiveModal>
  )
}
