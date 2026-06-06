'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { HcpForm } from '@/components/hcps/HcpForm'
import { type HcpFormData } from '@/lib/validations/hcp'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'
import { formatCPF, formatPhone, formatDate } from '@/lib/utils/formatters'
import { WEEKDAYS } from '@/lib/utils/constants'
import { HCP } from '@/types'
import { Pencil, Phone, Mail, MapPin, Calendar, User, Building2, Trash2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface HcpDetailModalProps {
  hcpId: string | null
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

type Tab = 'view' | 'edit'

const potentialConfig: Record<number, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  1: { label: 'Potencial 1 🔥', variant: 'success' },
  2: { label: 'Potencial 2', variant: 'success' },
  3: { label: 'Potencial 3', variant: 'warning' },
  4: { label: 'Potencial 4', variant: 'warning' },
  5: { label: 'Potencial 5', variant: 'neutral' },
  6: { label: 'Potencial 6', variant: 'neutral' },
}

const visitStatusLabels: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  rescheduled: 'Reagendada',
}
const visitStatusVariant: Record<string, 'info' | 'success' | 'neutral' | 'warning'> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'neutral',
  rescheduled: 'warning',
}

function HcpDetailContent({
  hcp,
  visits,
  onEdit,
  onClose,
  onDelete,
}: {
  hcp: HCP
  visits: Array<{ id: string; scheduled_at: string; status: string }>
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
}) {
  const pot = hcp.potential ? potentialConfig[hcp.potential] : null
  const weekdayLabels = hcp.weekdays?.map(d => WEEKDAYS.find(w => w.value === d)?.short).filter(Boolean)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary leading-tight">{hcp.name}</h3>
          <p className="text-sm text-text-secondary mt-0.5">{hcp.specialty}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {pot && <Badge variant={pot.variant}>{pot.label}</Badge>}
            {hcp.category && <Badge variant="neutral">Cat. {hcp.category}</Badge>}
            {hcp.adoption_curve && <Badge variant="neutral">{hcp.adoption_curve}</Badge>}
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Contact info */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Contato</p>
        <div className="space-y-2.5">
          <InfoRow icon={<User className="w-4 h-4" />} label="CRM" value={hcp.crm} />
          {hcp.cpf && <InfoRow icon={<User className="w-4 h-4" />} label="CPF" value={formatCPF(hcp.cpf)} />}
          {hcp.email && <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={hcp.email} />}
          {hcp.mobile_phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Celular" value={formatPhone(hcp.mobile_phone)} />}
          {hcp.landline_phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Fixo" value={formatPhone(hcp.landline_phone)} />}
        </div>
      </div>

      {/* Schedule */}
      {(weekdayLabels && weekdayLabels.length > 0) || hcp.office_hours_start ? (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Horários</p>
            <div className="space-y-2.5">
              {weekdayLabels && weekdayLabels.length > 0 && (
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Dias" value={weekdayLabels.join(', ')} />
              )}
              {hcp.office_hours_start && (
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Horário" value={`${hcp.office_hours_start}${hcp.office_hours_end ? ` – ${hcp.office_hours_end}` : ''}`} />
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Clinic */}
      {(hcp.clinic_name || hcp.clinic_address) && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Consultório</p>
            <div className="space-y-2.5">
              {hcp.clinic_name && <InfoRow icon={<Building2 className="w-4 h-4" />} label="Clínica" value={hcp.clinic_name} />}
              {hcp.clinic_address && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Endereço" value={hcp.clinic_address} />}
              {(hcp.clinic_city || hcp.clinic_state) && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Cidade" value={[hcp.clinic_city, hcp.clinic_state].filter(Boolean).join(' – ')} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {hcp.notes && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2">Observações</p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{hcp.notes}</p>
          </div>
        </>
      )}

      {/* Visit history */}
      {visits.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Últimas Visitas</p>
            <div className="space-y-2">
              {visits.map(v => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                    {formatDate(v.scheduled_at)}
                  </div>
                  <Badge variant={visitStatusVariant[v.status] ?? 'neutral'}>
                    {visitStatusLabels[v.status] ?? v.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onEdit} variant="primary" className="flex-1">
          <Pencil className="w-4 h-4" />
          Editar
        </Button>
        <Button onClick={onDelete} variant="danger" className="flex-1">
          <Trash2 className="w-4 h-4" />
          Excluir
        </Button>
      </div>
      <Button onClick={onClose} variant="secondary" className="w-full">
        Fechar
      </Button>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-accent shrink-0">{icon}</span>
      <span className="text-xs text-text-muted w-14 shrink-0">{label}</span>
      <span className="text-sm text-text-primary truncate">{value}</span>
    </div>
  )
}

export function HcpDetailModal({ hcpId, open, onClose, onUpdated }: HcpDetailModalProps) {
  const { toast } = useToast()
  const [hcp, setHcp] = useState<HCP | null>(null)
  const [visits, setVisits] = useState<Array<{ id: string; scheduled_at: string; status: string }>>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [tab, setTab] = useState<Tab>('view')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !hcpId) {
      setHcp(null)
      setVisits([])
      setTab('view')
      return
    }
    setFetching(true)
    const supabase = createClient()
    Promise.all([
      supabase.from('hcps').select('*').eq('id', hcpId).single(),
      supabase.from('visits').select('id, scheduled_at, status').eq('hcp_id', hcpId).order('scheduled_at', { ascending: false }).limit(5),
    ]).then(([hcpRes, visitsRes]) => {
      if (hcpRes.data) setHcp(hcpRes.data as HCP)
      if (visitsRes.data) setVisits(visitsRes.data)
      setFetching(false)
    })
  }, [open, hcpId])

  async function handleEdit(data: HcpFormData) {
    if (!hcpId) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sessão expirada'); setLoading(false); return }

    await ensureProfile(supabase, user)

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
      clinic_address_number: (data as typeof data & { clinic_address_number?: string }).clinic_address_number || null,
      clinic_city: data.clinic_city || null,
      clinic_state: data.clinic_state || null,
      clinic_zip: data.clinic_zip || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      notes: data.notes || null,
      weekdays: data.weekdays && data.weekdays.length > 0 ? data.weekdays : null,
      office_hours_start: data.office_hours_start || null,
      office_hours_end: data.office_hours_end || null,
    }).eq('id', hcpId)

    setLoading(false)
    if (error) {
      toast.error(error.code === '23505' ? 'CRM já cadastrado para outro médico' : 'Erro ao atualizar. Tente novamente.')
      return
    }
    toast.success('HCP atualizado com sucesso!')
    onUpdated?.()
    onClose()
  }

  async function handleDelete() {
    if (!hcpId) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('hcps').delete().eq('id', hcpId)
    setDeleting(false)

    if (error) {
      toast.error('Erro ao excluir HCP. Tente novamente.')
      return
    }
    toast.success('HCP excluído com sucesso!')
    setShowDeleteConfirm(false)
    onUpdated?.()
    onClose()
  }

  const formDefaults = hcp ? {
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
    latitude: hcp.latitude ?? null,
    longitude: hcp.longitude ?? null,
    notes: hcp.notes || '',
    weekdays: hcp.weekdays || [],
    office_hours_start: hcp.office_hours_start || '',
    office_hours_end: hcp.office_hours_end || '',
  } : undefined

  const loadingContent = (
    <div className="flex flex-col gap-4 py-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 rounded-lg bg-surface-2 animate-pulse" style={{ width: `${70 - i * 10}%` }} />
      ))}
    </div>
  )

  const content = (
    <div>
      {hcp && (
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl mb-5">
          {(['view', 'edit'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                tab === t ? 'bg-surface text-accent shadow-sm' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {t === 'view' ? 'Visualizar' : 'Editar'}
            </button>
          ))}
        </div>
      )}

      {fetching ? loadingContent : (
        <AnimatePresence mode="wait">
          {tab === 'view' && hcp ? (
            <motion.div key="view" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
              <HcpDetailContent hcp={hcp} visits={visits} onEdit={() => setTab('edit')} onClose={onClose} onDelete={() => setShowDeleteConfirm(true)} />
            </motion.div>
          ) : tab === 'edit' && hcp ? (
            <motion.div key="edit" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
              <HcpForm defaultValues={formDefaults} onSubmit={handleEdit} loading={loading} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  )

  const title = hcp ? hcp.name : 'Carregando...'

  return (
    <>
      <ResponsiveModal open={open} onClose={onClose} title={title} size="md" scrollable>
        {content}
      </ResponsiveModal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir HCP"
        message={`Tem certeza que deseja excluir "${hcp?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </>
  )
}
