'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  MapPin,
  MoreHorizontal,
  Kanban,
  Package,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { BottomSheet } from '@/components/ui/BottomSheet'

const mainItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/hcps', label: 'HCPs', icon: Users },
  { href: '/hcos', label: 'HCOs', icon: Building2 },
  { href: '/visits', label: 'Visitas', icon: Calendar },
  { href: '/map', label: 'Mapa', icon: MapPin },
]

const moreItems = [
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/inventory', label: 'Estoque', icon: Package },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isMoreActive = moreItems.some((item) => isActive(item.href))

  return (
    <>
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-accent shadow-bottom-sheet safe-area-bottom">
        <div className="flex items-center justify-around h-[72px] px-1 max-w-2xl mx-auto">
          {mainItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[56px] text-[11px] font-medium transition-all duration-150 ease-in-out active:scale-95',
                  active ? 'text-brand-green' : 'text-white/60'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-green rounded-full" />
                )}
                <Icon className="w-6 h-6" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[56px] text-[11px] font-medium transition-all duration-150 ease-in-out active:scale-95',
              isMoreActive ? 'text-brand-green' : 'text-white/60'
            )}
          >
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-green rounded-full" />
            )}
            <MoreHorizontal className="w-6 h-6" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet for "Mais" */}
      <BottomSheet open={showMore} onClose={() => setShowMore(false)} title="Mais opções">
        <div className="space-y-1">
          {moreItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-150 ease-in-out active:scale-[0.98]',
                  active
                    ? 'text-accent bg-accent-light'
                    : 'text-text-primary hover:bg-surface-2 active:bg-surface-2'
                )}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
