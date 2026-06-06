'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface HeaderProps {
  user: {
    full_name: string
    avatar_url: string | null
    email: string
  }
}

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/hcps': 'HCPs',
  '/hcos': 'HCOs',
  '/visits': 'Visitas',
  '/pipeline': 'Pipeline',
  '/inventory': 'Estoque',
  '/stats': 'Estatísticas',
  '/settings': 'Configurações',
}

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname]
  for (const [route, title] of Object.entries(routeTitles)) {
    if (route !== '/' && pathname.startsWith(route)) return title
  }
  return 'Dashboard'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 md:px-5 lg:px-8 bg-surface border-b border-border shadow-sm gap-4">
      {/* Left: logo + page title */}
      <div className="flex items-center gap-3 shrink-0">
        <img src="/logo.svg" alt="PharmaRep" className="w-8 h-8 rounded-lg object-contain md:hidden" />
        <h1 className="text-base font-semibold text-text-primary leading-tight">{title}</h1>
      </div>

      {/* Center: search bar */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors"
          />
        </div>
      </div>

      {/* Right: notifications + user + logout */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Bell */}
        <button
          type="button"
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-border" />

        {/* User info (desktop) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-accent">
                {getInitials(user.full_name)}
              </span>
            </div>
          )}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-text-primary leading-tight">{user.full_name}</p>
            <p className="text-xs text-text-muted leading-tight">{user.email}</p>
          </div>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            title="Sair"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:block">Sair</span>
          </button>
        </form>
      </div>
    </header>
  )
}
