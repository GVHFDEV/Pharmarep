'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  CalendarHeart,
  ClipboardList,
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
  { href: '/events', label: 'Eventos', icon: CalendarHeart },
  { href: '/surveys', label: 'Enquetes', icon: ClipboardList },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/inventory', label: 'Estoque', icon: Package },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMore, setShowMore] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isMoreActive = moreItems.some((item) => isActive(item.href))

  function navigateTo(href: string) {
    if (pathname === href) return
    setPendingHref(href)
    startTransition(() => {
      router.push(href)
      setPendingHref(null)
    })
  }

  return (
    <>
      {/* Top loading bar */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-brand-green/20">
          <div className="h-full bg-brand-green rounded-r-full animate-[progressBar_1.5s_ease-in-out_infinite]" />
        </div>
      )}

      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-accent shadow-bottom-sheet safe-area-bottom">
        <div className="flex items-center justify-around h-[72px] px-1 max-w-2xl mx-auto">
          {mainItems.map((item) => {
            const active = isActive(item.href)
            const pending = pendingHref === item.href
            const Icon = item.icon

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => navigateTo(item.href)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[56px] text-[11px] font-medium transition-all duration-150 ease-in-out active:scale-95',
                  active ? 'text-brand-green' : 'text-white/60',
                  pending && 'text-brand-green/80'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand-green rounded-full" />
                )}
                <Icon className={cn('w-6 h-6', pending && 'animate-pulse')} />
                <span className="truncate">{item.label}</span>
              </button>
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
            const pending = pendingHref === item.href
            const Icon = item.icon

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  setShowMore(false)
                  navigateTo(item.href)
                }}
                className={cn(
                  'flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-150 ease-in-out active:scale-[0.98] w-full text-left',
                  active
                    ? 'text-accent bg-accent-light'
                    : 'text-text-primary hover:bg-surface-2 active:bg-surface-2',
                  pending && 'opacity-70'
                )}
              >
                <Icon className={cn('w-6 h-6', pending && 'animate-pulse')} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
