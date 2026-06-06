'use client'

import { User, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { HCP } from '@/types'

interface HcpCardProps {
  hcp: HCP
  onClick: (id: string) => void
}

const potentialConfig: Record<number, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  1: { label: 'Pot. 1 🔥', variant: 'success' },
  2: { label: 'Pot. 2', variant: 'success' },
  3: { label: 'Pot. 3', variant: 'warning' },
  4: { label: 'Pot. 4', variant: 'warning' },
  5: { label: 'Pot. 5', variant: 'neutral' },
  6: { label: 'Pot. 6', variant: 'neutral' },
}

export function HcpCard({ hcp, onClick }: HcpCardProps) {
  const pot = hcp.potential ? potentialConfig[hcp.potential] : null

  return (
    <motion.button
      type="button"
      onClick={() => onClick(hcp.id)}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgba(8,49,42,0.14)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="bg-surface border border-border rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3 cursor-pointer w-full text-left"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{hcp.name}</p>
          <p className="text-xs text-text-secondary truncate">{hcp.specialty}</p>
        </div>
      </div>

      {/* CRM */}
      <p className="text-xs text-text-muted font-mono">CRM: {hcp.crm}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {pot && <Badge variant={pot.variant}>{pot.label}</Badge>}
        {hcp.category && <Badge variant="neutral">{hcp.category}</Badge>}
        {hcp.adoption_curve && (
          <Badge variant="neutral" className="max-w-[120px] truncate">
            {hcp.adoption_curve}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs font-medium text-accent">Ver perfil</span>
        <ChevronRight className="w-4 h-4 text-accent" />
      </div>
    </motion.button>
  )
}
