'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface DashboardCardValues {
  totalHcps: number
  inactiveHcps: number
  visitsThisMonth: number
  completedThisMonth: number
  pendingToday: number
}

// Icons and metadata defined here — NOT passed from Server Component
const CARDS = [
  {
    key: 'totalHcps' as const,
    label: 'HCPs Ativos',
    sub: 'Total ativos',
    icon: Users,
    accent: true,   // dark green card
  },
  {
    key: 'inactiveHcps' as const,
    label: 'HCPs Inativos',
    sub: 'Total inativos',
    icon: Users,
    accent: false,
  },
  {
    key: 'visitsThisMonth' as const,
    label: 'Visitas no Mês',
    sub: 'Agendadas + concluídas',
    icon: Calendar,
    accent: false,
  },
  {
    key: 'completedThisMonth' as const,
    label: 'Concluídas',
    sub: 'Este mês',
    icon: CheckCircle,
    accent: false,
  },
  {
    key: 'pendingToday' as const,
    label: 'Pendentes Hoje',
    sub: 'Aguardam visita',
    icon: Clock,
    accent: false,
  },
]

export function AnimatedDashboardCards({
  totalHcps,
  inactiveHcps,
  visitsThisMonth,
  completedThisMonth,
  pendingToday,
}: DashboardCardValues) {
  const values = { totalHcps, inactiveHcps, visitsThisMonth, completedThisMonth, pendingToday }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon
        const value = values[card.key]

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(8,49,42,0.18)' }}
            className={cn(
              'relative rounded-2xl p-5 shadow-sm border overflow-hidden cursor-default select-none',
              card.accent
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border'
            )}
          >
            {/* Decorative circle for the accent card */}
            {card.accent && (
              <>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-green/10" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              </>
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 w-9 h-9 rounded-xl flex items-center justify-center mb-4',
              card.accent ? 'bg-brand-green/20' : 'bg-accent-light'
            )}>
              <Icon className={cn('w-5 h-5', card.accent ? 'text-brand-green' : 'text-accent')} />
            </div>

            {/* Value */}
            <p className={cn(
              'relative z-10 text-3xl font-black tracking-tight leading-none mb-1',
              card.accent ? 'text-white' : 'text-text-primary'
            )}>
              {value}
            </p>

            {/* Label */}
            <p className={cn(
              'relative z-10 text-sm font-semibold leading-tight',
              card.accent ? 'text-white' : 'text-text-primary'
            )}>
              {card.label}
            </p>
            <p className={cn(
              'relative z-10 text-xs mt-0.5',
              card.accent ? 'text-brand-green/80' : 'text-text-muted'
            )}>
              {card.sub}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
