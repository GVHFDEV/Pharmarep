"use client"

import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  hoverable?: boolean
  className?: string
}

export function Card({ children, hoverable = false, className }: CardProps) {
  if (hoverable) {
    return (
      <motion.div
        className={cn(
          'bg-surface border border-border rounded-xl p-4 shadow-sm',
          className
        )}
        whileHover={{ y: -2, boxShadow: '0 4px 12px -2px rgba(8, 49, 42, 0.12), 0 2px 4px -2px rgba(0,0,0,0.05)' }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-4 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
