'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SurveyListClient } from '@/components/surveys/SurveyListClient'
import { SurveyCreateModal } from '@/components/surveys/SurveyCreateModal'

export default function SurveysPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Enquetes</h2>
          <p className="text-sm text-text-secondary mt-1">Pesquisas e formulários com médicos</p>
        </div>
      </div>

      <SurveyListClient refreshKey={refreshKey} />

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 xl:bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-text-on-accent rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 z-10"
        aria-label="Nova Enquete"
      >
        <Plus className="w-6 h-6" />
      </button>

      <SurveyCreateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => setRefreshKey(k => k + 1)}
      />
    </div>
  )
}
