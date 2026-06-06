'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  maxVisible?: number
  onChange?: (e: { target: { name?: string; value: string } }) => void
  name?: string
  value?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, maxVisible = 5, onChange, name, value, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || '')
    const containerRef = useRef<HTMLDivElement>(null)
    const hiddenRef = useRef<HTMLSelectElement>(null)

    // Sync external value
    useEffect(() => {
      if (value !== undefined) setSelectedValue(value)
    }, [value])

    // Close on outside click
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const selectedLabel = options.find(o => o.value === selectedValue)?.label

    function handleSelect(optValue: string) {
      setSelectedValue(optValue)
      setIsOpen(false)
      onChange?.({ target: { name, value: optValue } })
      // Trigger react-hook-form via hidden select
      if (hiddenRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLSelectElement.prototype, 'value'
        )?.set
        nativeInputValueSetter?.call(hiddenRef.current, optValue)
        hiddenRef.current.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    return (
      <div className="w-full relative" ref={containerRef}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Hidden native select for form compatibility */}
        <select
          ref={(node) => {
            (hiddenRef as React.MutableRefObject<HTMLSelectElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node
          }}
          id={id}
          name={name}
          value={selectedValue}
          onChange={(e) => {
            setSelectedValue(e.target.value)
            onChange?.({ target: { name, value: e.target.value } })
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Custom trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-3 xl:py-2 text-base xl:text-sm text-left transition-colors appearance-none',
            'focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-border',
            !selectedLabel && 'text-text-muted',
            className
          )}
        >
          {selectedLabel || placeholder || 'Selecione'}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            ▾
          </span>
        </button>

        {/* Dropdown - opens downward */}
        {isOpen && (
          <div
            className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-y-auto"
            style={{ maxHeight: `${maxVisible * 36}px` }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'w-full text-left px-3 py-3 xl:py-2 text-base xl:text-sm transition-colors',
                  'hover:bg-accent-light hover:text-accent',
                  opt.value === selectedValue
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-text-primary'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
export { Select }
