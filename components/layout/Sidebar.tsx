'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Kanban,
  Package,
  MapPin,
  Settings,
  CalendarHeart,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hcps', label: 'HCPs', icon: Users },
  { href: '/hcos', label: 'HCOs', icon: Building2 },
  { href: '/visits', label: 'Visitas', icon: Calendar },
]

const toolNavItems = [
  { href: '/events', label: 'Eventos', icon: CalendarHeart },
  { href: '/surveys', label: 'Enquetes', icon: ClipboardList },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/inventory', label: 'Estoque', icon: Package },
  { href: '/map', label: 'Mapa', icon: MapPin },
]

function NavItem({ href, label, icon: Icon, active, mounted }: {
  href: string; label: string; icon: typeof LayoutDashboard; active: boolean; mounted: boolean
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        active
          ? 'bg-brand-green text-accent shadow-sm'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      )}
    >
      {active && mounted && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-brand-green"
          style={{ zIndex: -1 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        />
      )}
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span className="hidden 2xl:block group-hover:block whitespace-nowrap overflow-hidden">
        {label}
      </span>
    </Link>
  )
}

export default function Sidebar({ user: _user }: { user: { full_name: string; avatar_url: string | null; email: string } }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="hidden xl:flex xl:flex-col xl:fixed xl:inset-y-0 xl:left-0 xl:z-30 xl:w-[72px] 2xl:w-[260px] bg-accent border-r border-white/10 shadow-sm transition-all duration-200 group hover:w-[260px]">

      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-4 py-3 border-b border-white/10 shrink-0">
        <img src="/logo.svg" alt="PharmaRep" className="max-w-[85%] h-12 object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 2xl:px-3 group-hover:px-3 overflow-y-auto">

        {/* PRINCIPAL */}
        <div className="mb-5">
          <p className="hidden 2xl:block group-hover:block px-3 mb-2 text-[10px] font-bold text-white/40 tracking-[0.12em] uppercase">
            Principal
          </p>
          <div className="space-y-0.5">
            {mainNavItems.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} mounted={mounted} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/10 mb-5" />

        {/* FERRAMENTAS */}
        <div>
          <p className="hidden 2xl:block group-hover:block px-3 mb-2 text-[10px] font-bold text-white/40 tracking-[0.12em] uppercase">
            Ferramentas
          </p>
          <div className="space-y-0.5">
            {toolNavItems.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} mounted={mounted} />
            ))}
          </div>
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-white/10 p-2 2xl:p-3 group-hover:p-3 shrink-0">
        <NavItem href="/settings" label="Configurações" icon={Settings} active={isActive('/settings')} mounted={mounted} />
      </div>
    </aside>
  )
}
