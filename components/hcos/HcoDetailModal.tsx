'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { HcoForm } from '@/components/hcos/HcoForm'
import { type HcoFormData } from '@/lib/validations/hco'
import { useToast } from '@/components/ui/Toast'
import { ensureProfile } from '@/lib/utils/ensureProfile'
import { formatCNPJ, formatPhone } from '@/lib/utils/formatters'
import { HCO } from '@/types'
import { Pencil, Phone, Mail, MapPin, Building2, User, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface HcoDetailModalProps {
  hcoId: string | null
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

type Tab = 'view' | 'edit'

const potentialConfig = {
  1: { label: 'Potencial 1 🔥', variant: 'success' as const },
  2: { label: 'Potencial 2', variant: 'warning' as const },
  3: { label: 'Potencial 3', variant: 'neutral' as const },
}

function HcoDetailContent({
  hco,
  onEdit,
  onClose,
  onDelete,
}: {
  hco: HCO
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
}) {
  const pot = hco.potential ? potentialConfig[hco.potential] : null

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary leading-tight">{hco.name}</h3>
          {hco.category && <p className="text-sm text-text-secondary mt-0.5">{hco.category}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {pot && <Badge variant={pot.variant}>{pot.label}</Badge>}
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Identification */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Identificação</p>
        <div className="space-y-2.5">
          {hco.cnpj && <InfoRow icon={<Building2 className="w-4 h-4" />} label="CNPJ" value={formatCNPJ(hco.cnpj)} />}
          {hco.pharmacists && hco.pharmacists.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-text-muted mb-1">Farmacêuticos:</p>
              {hco.pharmacists.map((p, i) => (
                <InfoRow key={i} icon={<User className="w-4 h-4" />} label={p.crf} value={p.name} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      {(hco.email || hco.phone || hco.whatsapp || hco.whatsapp2) && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Contato</p>
            <div className="space-y-2.5">
              {hco.email && <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={hco.email} />}
              {hco.phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={formatPhone(hco.phone)} />}
              {hco.whatsapp && <InfoRow icon={<Phone className="w-4 h-4" />} label="WhatsApp" value={formatPhone(hco.whatsapp)} />}
              {hco.whatsapp2 && <InfoRow icon={<Phone className="w-4 h-4" />} label="WhatsApp 2" value={formatPhone(hco.whatsapp2)} />}
            </div>
          </div>
        </>
      )}

      {/* Address */}
      {(hco.address || hco.city) && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Endereço</p>
            <div className="space-y-2.5">
              {hco.address && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Endereço" value={hco.address} />}
              {hco.neighborhood && <InfoRow icon={<MapPin className="w-4 h-4" />} label="Bairro" value={hco.neighborhood} />}
              {(hco.city || hco.state) && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Cidade" value={[hco.city, hco.state].filter(Boolean).join(' – ')} />
              )}
              {hco.zip && <InfoRow icon={<MapPin className="w-4 h-4" />} label="CEP" value={hco.zip} />}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {hco.notes && (
        <>
          <div className="border-t border-border" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2">Observações</p>
            <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{hco.notes}</p>
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

export function HcoDetailModal({ hcoId, open, onClose, onUpdated }: HcoDetailModalProps) {
  const { toast } = useToast()
  const [hco, setHco] = useState<HCO | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [tab, setTab] = useState<Tab>('view')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open || !hcoId) {
      setHco(null)
      setTab('view')
      return
    }
    setFetching(true)
    const supabase = createClient()
    supabase.from('hcos').select('*').eq('id', hcoId).single().then(({ data }) => {
      if (data) setHco(data as HCO)
      setFetching(false)
    })
  }, [open, hcoId])

  async function handleEdit(data: HcoFormData) {
    if (!hcoId) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sessão expirada'); setLoading(false); return }

    await ensureProfile(supabase, user)

    const { error } = await supabase.from('hcos').update({
      name: data.name,
      cnpj: data.cnpj || null,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      whatsapp2: data.whatsapp2 || null,
      address: data.address || null,
      address_number: (data as typeof data & { address_number?: string }).address_number || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      neighborhood: data.neighborhood || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      pharmacists: data.pharmacists && data.pharmacists.length > 0 ? data.pharmacists : null,
      category: data.category || null,
      potential: data.potential ? parseInt(data.potential) : null,
      notes: data.notes || null,
    }).eq('id', hcoId)

    setLoading(false)
    if (error) {
      toast.error(error.code === '23505' ? 'CNPJ já cadastrado para outra farmácia' : 'Erro ao atualizar. Tente novamente.')
      return
    }
    toast.success('HCO atualizado com sucesso!')
    onUpdated?.()
    onClose()
  }

  async function handleDelete() {
    if (!hcoId) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('hcos').delete().eq('id', hcoId)
    setDeleting(false)

    if (error) {
      toast.error('Erro ao excluir HCO. Tente novamente.')
      return
    }
    toast.success('HCO excluído com sucesso!')
    setShowDeleteConfirm(false)
    onUpdated?.()
    onClose()
  }

  const formDefaults = hco ? {
    name: hco.name,
    cnpj: hco.cnpj || '',
    email: hco.email || '',
    phone: hco.phone || '',
    whatsapp: hco.whatsapp || '',
    whatsapp2: hco.whatsapp2 || '',
    address: hco.address || '',
    address_number: hco.address_number || '',
    city: hco.city || '',
    state: hco.state || '',
    zip: hco.zip || '',
    neighborhood: hco.neighborhood || '',
    latitude: hco.latitude ?? null,
    longitude: hco.longitude ?? null,
    pharmacists: hco.pharmacists || [],
    category: hco.category || '',
    potential: hco.potential?.toString() || '',
    notes: hco.notes || '',
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
      {hco && (
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
          {tab === 'view' && hco ? (
            <motion.div key="view" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
              <HcoDetailContent hco={hco} onEdit={() => setTab('edit')} onClose={onClose} onDelete={() => setShowDeleteConfirm(true)} />
            </motion.div>
          ) : tab === 'edit' && hco ? (
            <motion.div key="edit" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
              <HcoForm defaultValues={formDefaults} onSubmit={handleEdit} loading={loading} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  )

  const title = hco ? hco.name : 'Carregando...'

  return (
    <>
      <ResponsiveModal open={open} onClose={onClose} title={title} size="md" scrollable>
        {content}
      </ResponsiveModal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir HCO"
        message={`Tem certeza que deseja excluir "${hco?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </>
  )
}
