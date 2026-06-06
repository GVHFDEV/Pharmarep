'use client'

import { Building2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { HCO } from '@/types'

interface HcoCardProps {
  hco: HCO
  onClick: (id: string) => void
}

const potentialConfig = {
  1: { label: 'Pot. 1 🔥', variant: 'success' as const },
  2: { label: 'Pot. 2', variant: 'warning' as const },
  3: { label: 'Pot. 3', variant: 'neutral' as const },
}

export function HcoCard({ hco, onClick }: HcoCardProps) {
  const pot = hco.potential ? potentialConfig[hco.potential] : null

  return (
    <motion.button
      type="button"
      onClick={() => onClick(hco.id)}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgba(8,49,42,0.14)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="bg-surface border border-border rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3 cursor-pointer w-full text-left"
    >
      {/* Icon + name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{hco.name}</p>
          {hco.city && <p className="text-xs text-text-secondary truncate">{hco.city}{hco.state ? ` – ${hco.state}` : ''}</p>}
        </div>
      </div>

      {/* CRF */}
      <p className="text-xs text-text-muted font-mono">CRF: {hco.crf}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {pot && <Badge variant={pot.variant}>{pot.label}</Badge>}
        {hco.category && <Badge variant="neutral">{hco.category}</Badge>}
        {hco.contact_person && (
          <Badge variant="neutral" className="max-w-[140px] truncate">
            {hco.contact_person}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs font-medium text-accent">Ver detalhes</span>
        <ChevronRight className="w-4 h-4 text-accent" />
      </div>
    </motion.button>
  )
}
