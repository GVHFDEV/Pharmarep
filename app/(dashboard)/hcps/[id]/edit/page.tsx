"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { HcpForm } from '@/components/hcps/HcpForm'
import { HcpFormData } from '@/lib/validations/hcp'
import { useToast } from '@/components/ui/Toast'
import { HCP } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'

export default function EditHcpPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [hcp, setHcp] = useState<HCP | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchHcp() {
      const supabase = createClient()
      const { data, error } = await supabase.from('hcps').select('*').eq('id', params.id).single()
      if (error) {
        toast.error('Erro ao carregar HCP')
        setFetching(false)
        return
      }
      if (data) setHcp(data as HCP)
      setFetching(false)
    }
    fetchHcp()
  }, [params.id])

  async function handleSubmit(data: HcpFormData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('hcps').update({
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
    }).eq('id', params.id)

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('CRM já cadastrado para outro médico')
      } else {
        toast.error('Erro ao atualizar HCP. Tente novamente.')
      }
      return
    }

    toast.success('HCP atualizado com sucesso!')
    router.push(`/hcps/${params.id}`)
  }

  if (fetching) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>
  }

  if (!hcp) {
    return <p className="text-text-muted">HCP não encontrado</p>
  }

  const defaultValues: Partial<HcpFormData> = {
    name: hcp.name,
    crm: hcp.crm,
    cpf: hcp.cpf || '',
    email: hcp.email || '',
    mobile_phone: hcp.mobile_phone || '',
    landline_phone: hcp.landline_phone || '',
    specialty: hcp.specialty,
    category: hcp.category || '',
    potential: hcp.potential?.toString() || '',
    adoption_curve: hcp.adoption_curve || '',
    clinic_name: hcp.clinic_name || '',
    clinic_address: hcp.clinic_address || '',
    clinic_address_number: hcp.clinic_address_number || '',
    clinic_city: hcp.clinic_city || '',
    clinic_state: hcp.clinic_state || '',
    clinic_zip: hcp.clinic_zip || '',
    latitude: hcp.latitude || null,
    longitude: hcp.longitude || null,
    notes: hcp.notes || '',
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Editar HCP</h2>
        <p className="text-sm text-text-secondary mt-1">{hcp.name}</p>
      </div>
      <HcpForm defaultValues={defaultValues} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
