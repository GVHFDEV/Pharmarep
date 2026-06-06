import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InactivateHcpButton } from '@/components/hcps/InactivateHcpButton'
import { formatCPF, formatPhone, formatDate } from '@/lib/utils/formatters'
import { Pencil, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import { HCP } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HcpDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: hcp } = await supabase
    .from('hcps')
    .select('*')
    .eq('id', id)
    .single()

  if (!hcp) notFound()

  // Try to fetch visits (table may not exist yet - handle gracefully)
  let visits: any[] = []
  try {
    const { data } = await supabase
      .from('visits')
      .select('id, scheduled_at, status, rating')
      .eq('hcp_id', id)
      .order('scheduled_at', { ascending: false })
      .limit(10)
    if (data) visits = data
  } catch {}

  // Try to fetch pipeline deal
  let pipelineDeal: any = null
  try {
    const { data } = await supabase
      .from('pipeline_deals')
      .select('stage, priority')
      .eq('hcp_id', id)
      .limit(1)
      .single()
    if (data) pipelineDeal = data
  } catch {}

  // Badge variants
  const potentialVariant = (hcp as HCP).potential === 1 ? 'success' : (hcp as HCP).potential === 2 ? 'warning' : 'neutral'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{hcp.name}</h2>
          <p className="text-sm text-text-secondary mt-1">{hcp.specialty}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {hcp.potential && <Badge variant={potentialVariant}>Potencial {hcp.potential}</Badge>}
            {hcp.category && <Badge variant="info">{hcp.category}</Badge>}
            {hcp.adoption_curve && <Badge variant="neutral">{hcp.adoption_curve}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/hcps/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="w-4 h-4" /> Editar
            </Button>
          </Link>
          <Link href={`/visits/new?hcp_id=${id}`}>
            <Button variant="primary" size="sm">
              <Calendar className="w-4 h-4" /> Nova Visita
            </Button>
          </Link>
          <InactivateHcpButton hcpId={id} hcpName={hcp.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Card */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Contato</h3>
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">CRM: {hcp.crm}</p>
            {hcp.cpf && <p className="text-text-secondary">CPF: {formatCPF(hcp.cpf)}</p>}
            {hcp.email && <p className="flex items-center gap-2 text-text-secondary"><Mail className="w-4 h-4" /> {hcp.email}</p>}
            {hcp.mobile_phone && <p className="flex items-center gap-2 text-text-secondary"><Phone className="w-4 h-4" /> {formatPhone(hcp.mobile_phone)}</p>}
            {hcp.landline_phone && <p className="text-text-secondary">Fixo: {formatPhone(hcp.landline_phone)}</p>}
          </div>
        </Card>

        {/* Clinic Card */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Consultório</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            {hcp.clinic_name && <p className="font-medium">{hcp.clinic_name}</p>}
            {hcp.clinic_address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {hcp.clinic_address}</p>}
            {(hcp.clinic_city || hcp.clinic_state) && <p>{[hcp.clinic_city, hcp.clinic_state].filter(Boolean).join(' - ')}</p>}
            {hcp.clinic_zip && <p>CEP: {hcp.clinic_zip}</p>}
            {!hcp.clinic_name && !hcp.clinic_address && <p className="text-text-muted">Nenhum endereço cadastrado</p>}
          </div>
        </Card>

        {/* Visit History Card */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Histórico de Visitas</h3>
          {visits.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhuma visita registrada</p>
          ) : (
            <div className="space-y-2">
              {visits.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <span className="text-text-secondary">{formatDate(v.scheduled_at)}</span>
                  <Badge variant={v.status === 'completed' ? 'success' : v.status === 'cancelled' ? 'neutral' : v.status === 'rescheduled' ? 'warning' : 'info'}>
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pipeline Card */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Pipeline</h3>
          {pipelineDeal ? (
            <p className="text-sm text-text-secondary">Estágio: {pipelineDeal.stage}</p>
          ) : (
            <p className="text-sm text-text-muted">Nenhum estágio no pipeline</p>
          )}
        </Card>
      </div>

      {/* Notes section */}
      {hcp.notes && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Observações</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{hcp.notes}</p>
        </Card>
      )}
    </div>
  )
}
