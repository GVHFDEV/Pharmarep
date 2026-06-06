'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { searchAddress, type GeocodingResult } from '@/lib/utils/geocoding'
import { cn } from '@/lib/utils/cn'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: GeocodingResult) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  label,
  placeholder = 'Endereço ou CEP...',
  disabled,
  error,
  className,
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }
    setLoading(true)
    try {
      const data = await searchAddress(query)
      setResults(data)
      setIsOpen(data.length > 0)
      setHighlightIndex(-1)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 400)
  }

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result)
    onChange(result.address.street || result.displayName.split(',')[0])
    setIsOpen(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      handleSelect(results[highlightIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border bg-surface pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors',
            'focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus',
            error ? 'border-danger' : 'border-border',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted animate-spin" />
        )}
      </div>

      {error && <p className="text-xs text-danger mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-md max-h-60 overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={`${result.latitude}-${result.longitude}-${idx}`}
              type="button"
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full text-left px-3 py-2.5 text-sm transition-colors border-b border-border/50 last:border-b-0',
                'hover:bg-surface-2',
                idx === highlightIndex && 'bg-accent-light'
              )}
            >
              <span className="block text-text-primary truncate">
                {result.address.street || result.displayName.split(',')[0]}
              </span>
              <span className="block text-xs text-text-muted truncate mt-0.5">
                {[
                  result.address.neighborhood,
                  result.address.city,
                  result.address.state,
                  result.address.zip && `CEP: ${result.address.zip}`,
                ].filter(Boolean).join(' • ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
