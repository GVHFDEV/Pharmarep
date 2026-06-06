import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        variant === 'success' && 'bg-success-light text-success border-success-border',
        variant === 'warning' && 'bg-warning-light text-warning border-warning-border',
        variant === 'danger' && 'bg-danger-light text-danger border-danger-border',
        variant === 'info' && 'bg-info-light text-info border-info-border',
        variant === 'neutral' && 'bg-neutral-light text-neutral border-neutral-border',
        className
      )}
    >
      {children}
    </span>
  )
}
