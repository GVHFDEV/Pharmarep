"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VisitForm } from '@/components/visits/VisitForm'
import { type VisitFormData } from '@/lib/validations/visit'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'

function NewVisitContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [preselectedHcp, setPreselectedHcp] = useState<{ id: string; name: string } | null>(null)

  const hcpId = searchParams.get('hcp_id')

  // Pre-select HCP if query param is present
  useEffect(() => {
    if (!hcpId) return

    async function fetchHcp() {
      const supabase = createClient()
      const { data } = await supabase
        .from('hcps')
        .select('id, name')
        .eq('id', hcpId)
        .single()

      if (data) {
        setPreselectedHcp({ id: data.id, name: data.name })
      }
    }

    fetchHcp()
  }, [hcpId])

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
    router.push('/visits')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Nova Visita</h2>
        <p className="text-sm text-text-secondary mt-1">Agende uma visita a um médico</p>
      </div>
      <VisitForm
        preselectedHcp={preselectedHcp}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}

export default function NewVisitPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-muted">Carregando...</div>}>
      <NewVisitContent />
    </Suspense>
  )
}
