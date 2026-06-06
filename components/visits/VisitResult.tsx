"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { VISIT_RATINGS } from '@/lib/utils/constants'

interface VisitResultProps {
  visitId: string
  open: boolean
  onClose: () => void
  onSaved: () => void
}

type VisitStatus = 'completed' | 'cancelled' | 'rescheduled'
type Rating = 'great' | 'good' | 'neutral' | 'bad'

interface ProductWithSamples {
  product_id: string
  name: string
  product_type: string
  samples: number
  stock: number
}

const STATUS_OPTIONS: { value: VisitStatus; label: string }[] = [
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'rescheduled', label: 'Reagendada' },
]

export function VisitResult({ visitId, open, onClose, onSaved }: VisitResultProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<VisitStatus>('completed')
  const [rating, setRating] = useState<Rating | null>(null)
  const [notes, setNotes] = useState('')
  const [products, setProducts] = useState<ProductWithSamples[]>([])
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    if (!open) return

    async function fetchProducts() {
      setProductsLoading(true)
      const supabase = createClient()

      // Fetch products with inventory stock
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, product_type')
        .eq('active', true)
        .order('name')

      if (!prods) { setProductsLoading(false); return }

      // Fetch inventory for stock quantities
      const { data: inventory } = await supabase
        .from('inventory')
        .select('product_id, quantity')

      const stockMap = new Map<string, number>()
      inventory?.forEach(i => stockMap.set(i.product_id, i.quantity))

      setProducts(prods.map(p => ({
        product_id: p.id,
        name: p.name,
        product_type: p.product_type || 'amostra',
        samples: 0,
        stock: stockMap.get(p.id) || 0,
      })))
      setProductsLoading(false)
    }

    fetchProducts()
    setStatus('completed')
    setRating(null)
    setNotes('')
  }, [open])

  const handleSampleChange = (productId: string, value: number) => {
    setProducts(prev => prev.map(p => p.product_id === productId ? { ...p, samples: Math.max(0, value) } : p))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error: visitError } = await supabase
        .from('visits')
        .update({
          status,
          rating: status === 'completed' ? rating : null,
          notes: notes || null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', visitId)

      if (visitError) throw visitError

      const productsWithSamples = products.filter(p => p.samples > 0)

      for (const product of productsWithSamples) {
        const { error: vpError } = await supabase
          .from('visit_products')
          .insert({
            visit_id: visitId,
            product_id: product.product_id,
            samples_delivered: product.samples,
          })
        if (vpError) throw vpError

        const { data: inventory } = await supabase
          .from('inventory')
          .select('id, quantity, user_id')
          .eq('product_id', product.product_id)
          .single()

        if (inventory) {
          const { error: invError } = await supabase
            .from('inventory')
            .update({ quantity: Math.max(0, inventory.quantity - product.samples) })
            .eq('id', inventory.id)
          if (invError) throw invError

          await supabase.from('inventory_transactions').insert({
            user_id: inventory.user_id,
            product_id: product.product_id,
            type: 'exit',
            quantity: product.samples,
            reason: 'Entrega em visita',
            visit_id: visitId,
          })
        }
      }

      toast.success('Resultado da visita registrado com sucesso!')
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao salvar resultado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const amostras = products.filter(p => p.product_type === 'amostra')
  const materiais = products.filter(p => p.product_type === 'material')

  const formContent = (
    <div className="space-y-5">
      {/* Status toggle */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                status === opt.value
                  ? 'bg-accent text-text-on-accent border-accent'
                  : 'bg-surface text-text-secondary border-border hover:bg-surface-2'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      {status === 'completed' && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Avaliação</label>
          <div className="flex gap-3">
            {VISIT_RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(r.value as Rating)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                  rating === r.value
                    ? 'bg-accent-light border-accent text-accent'
                    : 'bg-surface border-border text-text-secondary hover:bg-surface-2'
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <span className="text-[10px] font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus resize-none"
          placeholder="Anotações sobre a visita..."
        />
      </div>

      {/* Products - separated by type */}
      {status === 'completed' && (
        <>
          {/* Amostras */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Amostras Entregues
            </label>
            {productsLoading ? (
              <p className="text-sm text-text-muted">Carregando...</p>
            ) : amostras.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhuma amostra cadastrada</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {amostras.map((product) => (
                  <ProductRow key={product.product_id} product={product} onChange={handleSampleChange} />
                ))}
              </div>
            )}
          </div>

          {/* Material Promocional */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Material Promocional
            </label>
            {productsLoading ? (
              <p className="text-sm text-text-muted">Carregando...</p>
            ) : materiais.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum material cadastrado</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {materiais.map((product) => (
                  <ProductRow key={product.product_id} product={product} onChange={handleSampleChange} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Button onClick={handleSubmit} loading={loading} className="w-full">
        Salvar Resultado
      </Button>
    </div>
  )

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Registrar Resultado" size="md" scrollable>
      {formContent}
    </ResponsiveModal>
  )
}

function ProductRow({ product, onChange }: { product: ProductWithSamples; onChange: (id: string, v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-border bg-surface">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-text-primary truncate block">{product.name}</span>
        <span className="text-[10px] text-text-muted">Estoque: {product.stock}</span>
      </div>
      <div className="flex items-center gap-2">
        {product.samples > product.stock && (
          <Badge variant="danger">!</Badge>
        )}
        <input
          type="number"
          min={0}
          value={product.samples || ''}
          onChange={(e) => onChange(product.product_id, parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-16 px-2 py-1 text-sm text-center border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
        />
      </div>
    </div>
  )
}
