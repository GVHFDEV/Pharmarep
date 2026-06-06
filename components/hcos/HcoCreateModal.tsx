'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HcoForm } from '@/components/hcos/HcoForm'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { HcoFormData } from '@/lib/validations/hco'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'

interface HcoCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function HcoCreateModal({ open, onClose, onCreated }: HcoCreateModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: HcoFormData) {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sessão expirada')
      setLoading(false)
      return
    }

    await ensureProfile(supabase, user)

    const { error } = await supabase.from('hcos').insert({
      user_id: user.id,
      name: data.name,
      crf: data.crf,
      cnpj: data.cnpj || null,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      address_number: data.address_number || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      neighborhood: data.neighborhood || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      contact_person: data.contact_person || null,
      category: data.category || null,
      potential: data.potential ? parseInt(data.potential) : null,
      notes: data.notes || null,
    })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('CRF já cadastrado para outra farmácia')
      } else {
        toast.error('Erro ao cadastrar HCO. Tente novamente.')
      }
      return
    }

    toast.success('HCO cadastrado com sucesso!')
    onCreated()
    onClose()
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Nova Farmácia (HCO)" size="md" scrollable>
      <HcoForm onSubmit={handleSubmit} loading={loading} />
    </ResponsiveModal>
  )
}
