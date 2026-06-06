import { InventoryClient } from '@/components/inventory/InventoryClient'

export default function InventoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Estoque</h2>
        <p className="text-sm text-text-secondary mt-1">Controle de amostras e produtos</p>
      </div>
      <InventoryClient />
    </div>
  )
}
