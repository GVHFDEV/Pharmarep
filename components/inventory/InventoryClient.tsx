"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, AlertTriangle, Package, ArrowUpCircle, ArrowDownCircle, History, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ResponsiveModal } from "@/components/ui/ResponsiveModal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/Toast"
import { formatRelativeDate, formatDateTime } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/cn"
import type { InventoryItem, Product, InventoryTransaction } from "@/types"

type InventoryWithProduct = Omit<InventoryItem, "product"> & {
  product: Pick<Product, "name" | "category" | "active"> & { purpose?: string | null }
}

export function InventoryClient() {
  const [items, setItems] = useState<InventoryWithProduct[]>([])
  const [transactions, setTransactions] = useState<(InventoryTransaction & { product?: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStock, setShowAddStock] = useState(false)
  const [showRemoveStock, setShowRemoveStock] = useState(false)
  const [showEditMin, setShowEditMin] = useState(false)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryWithProduct | null>(null)
  const [addQty, setAddQty] = useState("")
  const [removeQty, setRemoveQty] = useState("")
  const [removeReason, setRemoveReason] = useState("")
  const [newMin, setNewMin] = useState("")
  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState("")
  const [newProductPurpose, setNewProductPurpose] = useState("")
  const [newProductType, setNewProductType] = useState<"amostra" | "material">("amostra")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const fetchInventory = useCallback(async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*, product:products(name, category, active, purpose)")
      .order("updated_at", { ascending: false })

    if (error) {
      toast.error("Erro ao carregar estoque")
      setLoading(false)
      return
    }

    setItems((data as InventoryWithProduct[]) ?? [])
    setLoading(false)
  }, [])

  const fetchTransactions = useCallback(async () => {
    const { data } = await supabase
      .from("inventory_transactions")
      .select("*, product:products(name), visit:visits(hcps(name))")
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) setTransactions(data)
  }, [])

  useEffect(() => {
    fetchInventory()
    fetchTransactions()
  }, [fetchInventory, fetchTransactions])

  // Stats
  const totalProducts = items.length
  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0)
  const lowStock = items.filter(i => i.quantity < i.min_quantity).length

  const handleAddStock = async () => {
    if (!selectedItem || !addQty) return
    const qty = parseInt(addQty, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error("Informe uma quantidade válida")
      return
    }

    setSaving(true)
    const newQuantity = selectedItem.quantity + qty

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", selectedItem.id)

    if (error) { toast.error("Erro ao adicionar estoque"); setSaving(false); return }

    // Log transaction
    await supabase.from("inventory_transactions").insert({
      user_id: selectedItem.user_id,
      product_id: selectedItem.product_id,
      type: "entry",
      quantity: qty,
      reason: "Entrada manual",
    })

    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, quantity: newQuantity, updated_at: new Date().toISOString() } : i))
    toast.success(`${qty} unidades adicionadas`)
    setShowAddStock(false)
    setAddQty("")
    setSelectedItem(null)
    setSaving(false)
    fetchTransactions()
  }

  const handleRemoveStock = async () => {
    if (!selectedItem || !removeQty) return
    const qty = parseInt(removeQty, 10)
    if (isNaN(qty) || qty <= 0) { toast.error("Informe uma quantidade válida"); return }
    if (qty > selectedItem.quantity) { toast.error("Quantidade maior que estoque disponível"); return }

    setSaving(true)
    const newQuantity = selectedItem.quantity - qty

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", selectedItem.id)

    if (error) { toast.error("Erro ao remover estoque"); setSaving(false); return }

    await supabase.from("inventory_transactions").insert({
      user_id: selectedItem.user_id,
      product_id: selectedItem.product_id,
      type: "exit",
      quantity: qty,
      reason: removeReason || "Saída manual",
    })

    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, quantity: newQuantity, updated_at: new Date().toISOString() } : i))
    toast.success(`${qty} unidades removidas`)
    setShowRemoveStock(false)
    setRemoveQty("")
    setRemoveReason("")
    setSelectedItem(null)
    setSaving(false)
    fetchTransactions()
  }

  const handleEditMin = async () => {
    if (!selectedItem || !newMin) return
    const min = parseInt(newMin, 10)
    if (isNaN(min) || min < 0) { toast.error("Informe um valor mínimo válido"); return }

    setSaving(true)
    const { error } = await supabase
      .from("inventory")
      .update({ min_quantity: min, updated_at: new Date().toISOString() })
      .eq("id", selectedItem.id)

    if (error) { toast.error("Erro ao atualizar mínimo"); setSaving(false); return }

    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, min_quantity: min, updated_at: new Date().toISOString() } : i))
    toast.success("Mínimo atualizado")
    setShowEditMin(false)
    setNewMin("")
    setSelectedItem(null)
    setSaving(false)
  }

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Sessão expirada"); setSaving(false); return }

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: newProductName.trim(),
        category: newProductCategory.trim() || null,
        purpose: newProductPurpose.trim() || null,
        product_type: newProductType,
      })
      .select()
      .single()

    if (productError) { toast.error("Erro ao criar produto"); setSaving(false); return }

    const { data: inventory, error: invError } = await supabase
      .from("inventory")
      .insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 0,
        unit: "unidade",
        min_quantity: 0,
      })
      .select("*, product:products(name, category, active, purpose)")
      .single()

    if (invError) { toast.error("Produto criado, mas erro no estoque"); setSaving(false); return }

    setItems(prev => [inventory as InventoryWithProduct, ...prev])
    toast.success("Produto criado com sucesso")
    setShowNewProduct(false)
    setNewProductName("")
    setNewProductCategory("")
    setNewProductPurpose("")
    setNewProductType("amostra")
    setSaving(false)
  }

  const handleDeleteProduct = async () => {
    if (!selectedItem) return
    setDeleting(true)

    // Delete inventory first, then product
    await supabase.from("inventory").delete().eq("id", selectedItem.id)
    const { error } = await supabase.from("products").delete().eq("id", selectedItem.product_id)

    setDeleting(false)
    if (error) { toast.error("Erro ao excluir produto"); return }

    setItems(prev => prev.filter(i => i.id !== selectedItem.id))
    toast.success("Produto excluído")
    setShowDeleteConfirm(false)
    setSelectedItem(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{totalProducts}</p>
          <p className="text-xs text-text-muted">Produtos</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <ArrowUpCircle className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{totalUnits}</p>
          <p className="text-xs text-text-muted">Unidades</p>
        </div>
        <div className={cn("bg-surface border border-border rounded-xl p-4 text-center", lowStock > 0 && "border-danger bg-danger-light")}>
          <AlertTriangle className={cn("w-5 h-5 mx-auto mb-1", lowStock > 0 ? "text-danger" : "text-text-muted")} />
          <p className={cn("text-2xl font-bold", lowStock > 0 ? "text-danger" : "text-text-primary")}>{lowStock}</p>
          <p className="text-xs text-text-muted">Estoque Baixo</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setShowNewProduct(true)} size="sm">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
        <Button onClick={() => setShowTransactions(true)} size="sm" variant="secondary">
          <History className="w-4 h-4" /> Transações
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-text-muted mb-4" />
          <p className="text-text-secondary">Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-2 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Produto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Finalidade</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Qtd</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Mínimo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Atualização</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={cn("border-b border-border", item.quantity < item.min_quantity && "bg-danger-light border-l-4 border-l-danger")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{item.product.name}</span>
                          {item.product.category && <Badge variant="neutral">{item.product.category}</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.product.purpose || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-primary font-medium">{item.quantity}</span>
                          {item.quantity < item.min_quantity && <Badge variant="danger"><AlertTriangle className="w-3 h-3 mr-1" />Baixo</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.min_quantity}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{formatRelativeDate(item.updated_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="secondary" onClick={() => { setSelectedItem(item); setShowAddStock(true) }}>
                            <ArrowUpCircle className="w-3 h-3" /> Entrada
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowRemoveStock(true) }}>
                            <ArrowDownCircle className="w-3 h-3" /> Saída
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setNewMin(String(item.min_quantity)); setShowEditMin(true) }}>
                            Mín
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setShowDeleteConfirm(true) }}>
                            <Trash2 className="w-3 h-3 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className={cn("bg-surface border border-border rounded-xl p-4", item.quantity < item.min_quantity && "bg-danger-light border-l-4 border-l-danger")}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.product.name}</p>
                    {item.product.purpose && <p className="text-xs text-text-muted mt-0.5">{item.product.purpose}</p>}
                    {item.product.category && <Badge variant="neutral" className="mt-1">{item.product.category}</Badge>}
                  </div>
                  <div className="flex gap-1">
                    {item.quantity < item.min_quantity && <Badge variant="danger"><AlertTriangle className="w-3 h-3" /></Badge>}
                    <button onClick={() => { setSelectedItem(item); setShowDeleteConfirm(true) }} className="p-1 text-danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div><p className="text-xs text-text-muted">Qtd</p><p className="text-sm font-semibold text-text-primary">{item.quantity}</p></div>
                  <div><p className="text-xs text-text-muted">Unidade</p><p className="text-sm text-text-secondary">{item.unit}</p></div>
                  <div><p className="text-xs text-text-muted">Mínimo</p><p className="text-sm text-text-secondary">{item.min_quantity}</p></div>
                </div>

                <p className="text-xs text-text-muted mb-3">Atualizado {formatRelativeDate(item.updated_at)}</p>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setSelectedItem(item); setShowAddStock(true) }}>
                    <ArrowUpCircle className="w-3 h-3" /> Entrada
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setSelectedItem(item); setShowRemoveStock(true) }}>
                    <ArrowDownCircle className="w-3 h-3" /> Saída
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedItem(item); setNewMin(String(item.min_quantity)); setShowEditMin(true) }}>
                    Mín
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Stock Modal */}
      <ResponsiveModal open={showAddStock} onClose={() => { setShowAddStock(false); setAddQty(""); setSelectedItem(null) }} title="Entrada de Estoque">
        <div className="flex flex-col gap-4">
          {selectedItem && <p className="text-sm text-text-secondary">Produto: <strong>{selectedItem.product.name}</strong> — Atual: <strong>{selectedItem.quantity}</strong></p>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantidade</label>
            <input type="number" min="1" value={addQty} onChange={(e) => setAddQty(e.target.value)} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <Button onClick={handleAddStock} loading={saving} className="w-full">Confirmar Entrada</Button>
        </div>
      </ResponsiveModal>

      {/* Remove Stock Modal */}
      <ResponsiveModal open={showRemoveStock} onClose={() => { setShowRemoveStock(false); setRemoveQty(""); setRemoveReason(""); setSelectedItem(null) }} title="Saída de Estoque">
        <div className="flex flex-col gap-4">
          {selectedItem && <p className="text-sm text-text-secondary">Produto: <strong>{selectedItem.product.name}</strong> — Disponível: <strong>{selectedItem.quantity}</strong></p>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantidade</label>
            <input type="number" min="1" max={selectedItem?.quantity} value={removeQty} onChange={(e) => setRemoveQty(e.target.value)} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Motivo (opcional)</label>
            <input type="text" value={removeReason} onChange={(e) => setRemoveReason(e.target.value)} placeholder="Ex: Perda, vencimento..." className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <Button onClick={handleRemoveStock} loading={saving} className="w-full" variant="danger">Confirmar Saída</Button>
        </div>
      </ResponsiveModal>

      {/* Edit Min */}
      <ResponsiveModal open={showEditMin} onClose={() => { setShowEditMin(false); setNewMin(""); setSelectedItem(null) }} title="Editar Mínimo" size="sm">
        <div className="flex flex-col gap-4">
          {selectedItem && <p className="text-sm text-text-secondary">Produto: <strong>{selectedItem.product.name}</strong> — Mínimo atual: <strong>{selectedItem.min_quantity}</strong></p>}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Novo mínimo</label>
            <input type="number" min="0" value={newMin} onChange={(e) => setNewMin(e.target.value)} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <Button onClick={handleEditMin} loading={saving} className="w-full">Salvar</Button>
        </div>
      </ResponsiveModal>

      {/* New Product Modal */}
      <ResponsiveModal open={showNewProduct} onClose={() => { setShowNewProduct(false); setNewProductName(""); setNewProductCategory(""); setNewProductPurpose(""); setNewProductType("amostra") }} title="Novo Produto" size="sm">
        <NewProductForm
          name={newProductName} category={newProductCategory} purpose={newProductPurpose} productType={newProductType}
          onNameChange={setNewProductName} onCategoryChange={setNewProductCategory} onPurposeChange={setNewProductPurpose} onTypeChange={setNewProductType}
          onSubmit={handleCreateProduct} saving={saving}
        />
      </ResponsiveModal>

      {/* Transactions Modal */}
      <ResponsiveModal open={showTransactions} onClose={() => setShowTransactions(false)} title="Histórico de Transações" size="lg" scrollable>
        <TransactionsList transactions={transactions} />
      </ResponsiveModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedItem(null) }}
        onConfirm={handleDeleteProduct}
        title="Excluir Produto"
        message={`Excluir "${selectedItem?.product.name}"? Todas as transações relacionadas serão perdidas.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </>
  )
}

function NewProductForm({
  name, category, purpose, productType,
  onNameChange, onCategoryChange, onPurposeChange, onTypeChange,
  onSubmit, saving,
}: {
  name: string; category: string; purpose: string; productType: "amostra" | "material"
  onNameChange: (v: string) => void; onCategoryChange: (v: string) => void; onPurposeChange: (v: string) => void; onTypeChange: (v: "amostra" | "material") => void
  onSubmit: () => void; saving: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Type toggle */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Tipo *</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onTypeChange("amostra")} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${productType === "amostra" ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-accent"}`}>
            💊 Amostra
          </button>
          <button type="button" onClick={() => onTypeChange("material")} className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${productType === "material" ? "border-accent bg-accent text-white" : "border-border bg-surface text-text-secondary hover:border-accent"}`}>
            📄 Material Promocional
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
        <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder={productType === "amostra" ? "Ex: Losartana 50mg" : "Ex: Lâmina Cardiovascular"} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Finalidade</label>
        <input type="text" value={purpose} onChange={(e) => onPurposeChange(e.target.value)} placeholder="Ex: Anti-hipertensivo, Folheto educacional..." className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Categoria</label>
        <input type="text" value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="Ex: Comprimido, Folheto, Lâmina..." className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>
      <Button onClick={onSubmit} disabled={!name.trim()} loading={saving} className="w-full">Criar Produto</Button>
    </div>
  )
}

function TransactionsList({ transactions }: { transactions: (InventoryTransaction & { product?: { name: string }; visit?: { hcps: { name: string } | null } | null })[] }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-text-muted text-center py-8">Nenhuma transação registrada.</p>
  }

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
      {transactions.map((tx) => {
        const hcpName = tx.visit?.hcps?.name
        return (
          <div key={tx.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-border bg-surface">
            {tx.type === 'entry' ? (
              <ArrowUpCircle className="w-5 h-5 text-success shrink-0" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-danger shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{tx.product?.name ?? 'Produto'}</p>
              <p className="text-xs text-text-muted">
                {tx.reason || (tx.type === 'entry' ? 'Entrada' : 'Saída')}
                {hcpName && <span className="ml-1 text-accent">→ {hcpName}</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-sm font-bold", tx.type === 'entry' ? 'text-success' : 'text-danger')}>
                {tx.type === 'entry' ? '+' : '-'}{tx.quantity}
              </p>
              <p className="text-[10px] text-text-muted">{formatDateTime(tx.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
