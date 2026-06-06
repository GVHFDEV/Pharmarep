'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HcpForm } from '@/components/hcps/HcpForm'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { HcpFormData } from '@/lib/validations/hcp'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'

interface HcpCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function HcpCreateModal({ open, onClose, onCreated }: HcpCreateModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: HcpFormData) {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Sessão expirada')
      setLoading(false)
      return
    }

    await ensureProfile(supabase, user)

    const { error } = await supabase.from('hcps').insert({
      user_id: user.id,
      name: data.name,
      crm: data.crm,
      cpf: data.cpf || null,
      email: data.email || null,
      mobile_phone: data.mobile_phone || null,
      landline_phone: data.landline_phone || null,
      specialty: data.specialty,
      category: data.category || null,
      potential: data.potential ? parseInt(data.potential) : null,
      adoption_curve: data.adoption_curve || null,
      clinic_name: data.clinic_name || null,
      clinic_address: data.clinic_address || null,
      clinic_address_number: data.clinic_address_number || null,
      clinic_city: data.clinic_city || null,
      clinic_state: data.clinic_state || null,
      clinic_zip: data.clinic_zip || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      notes: data.notes || null,
      weekdays: data.weekdays && data.weekdays.length > 0 ? data.weekdays : null,
      office_hours_start: data.office_hours_start || null,
      office_hours_end: data.office_hours_end || null,
    })

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('CRM já cadastrado para outro médico')
      } else {
        toast.error('Erro ao cadastrar HCP. Tente novamente.')
      }
      return
    }

    toast.success('HCP cadastrado com sucesso!')
    onCreated()
    onClose()
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Novo HCP" size="md" scrollable>
      <HcpForm onSubmit={handleSubmit} loading={loading} />
    </ResponsiveModal>
  )
}
