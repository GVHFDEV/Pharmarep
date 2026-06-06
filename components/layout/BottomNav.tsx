'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Kanban,
  MoreHorizontal,
  Package,
  MapPin,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const mainItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hcps', label: 'HCPs', icon: Users },
  { href: '/hcos', label: 'HCOs', icon: Building2 },
  { href: '/visits', label: 'Visitas', icon: Calendar },
]

const moreItems = [
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/inventory', label: 'Estoque', icon: Package },
  { href: '/map', label: 'Mapa', icon: MapPin },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isMoreActive = moreItems.some((item) => isActive(item.href))

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMore(false)
      }
    }
    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMore])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-surface border-t border-border shadow-bottom-sheet">
      <div className="flex items-center justify-around h-full px-2">
        {mainItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-all duration-150 ease-in-out',
                active ? 'text-accent' : 'text-text-muted'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-green rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}

        {/* More menu */}
        <div ref={moreRef} className="relative flex-1 flex items-center justify-center h-full">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 h-full w-full text-xs transition-all duration-150 ease-in-out',
              isMoreActive ? 'text-accent' : 'text-text-muted'
            )}
          >
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-green rounded-full" />
            )}
            <MoreHorizontal className="w-5 h-5" />
            <span>Mais</span>
          </button>

          {/* Dropdown */}
          {showMore && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface border border-border rounded-lg shadow-md py-1">
              {moreItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ease-in-out',
                      active
                        ? 'text-accent bg-accent-light'
                        : 'text-text-secondary hover:bg-surface-2'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
