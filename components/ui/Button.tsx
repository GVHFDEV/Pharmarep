import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
          // Variants
          variant === 'primary' && 'bg-accent text-text-on-accent hover:bg-accent-hover focus:ring-accent shadow-sm',
          variant === 'secondary' && 'bg-surface text-text-primary border border-border hover:bg-surface-2 focus:ring-border-focus',
          variant === 'danger' && 'bg-danger text-text-on-accent hover:bg-red-700 focus:ring-danger',
          variant === 'ghost' && 'text-text-secondary hover:bg-accent-light hover:text-accent focus:ring-accent',
          // Sizes
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
