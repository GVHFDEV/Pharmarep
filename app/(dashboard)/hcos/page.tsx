'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { HcoListClient } from '@/components/hcos/HcoListClient'
import { HcoCreateModal } from '@/components/hcos/HcoCreateModal'

export default function HcosPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleCreated() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">HCOs</h2>
          <p className="text-sm text-text-secondary mt-1">Farmácias e organizações de saúde</p>
        </div>
      </div>

      <HcoListClient refreshKey={refreshKey} />

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 xl:bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-text-on-accent rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 z-10"
        aria-label="Nova Farmácia"
      >
        <Plus className="w-6 h-6" />
      </button>

      <HcoCreateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
