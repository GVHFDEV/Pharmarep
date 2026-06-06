'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VisitForm } from '@/components/visits/VisitForm'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { type VisitFormData } from '@/lib/validations/visit'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'

interface VisitCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  preselectedHcp?: { id: string; name: string } | null
}

export function VisitCreateModal({ open, onClose, onCreated, preselectedHcp }: VisitCreateModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: VisitFormData) {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sessão expirada')
      setLoading(false)
      return
    }

    await ensureProfile(supabase, user)

    const { error } = await supabase.from('visits').insert({
      user_id: user.id,
      hcp_id: data.hcp_id,
      scheduled_at: data.scheduled_at,
      channel: data.channel,
      location: data.location || null,
      notes: data.notes || null,
      status: 'scheduled',
    })

    setLoading(false)

    if (error) {
      toast.error('Erro ao agendar visita. Tente novamente.')
      return
    }

    toast.success('Visita agendada com sucesso!')
    onCreated()
    onClose()
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Nova Visita" size="md" scrollable>
      <VisitForm preselectedHcp={preselectedHcp} onSubmit={handleSubmit} loading={loading} />
    </ResponsiveModal>
  )
}
