'use client'

import { Search, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface HeaderProps {
  user: {
    full_name: string
    avatar_url: string | null
    email: string
  }
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
  return (
    <header className="hidden xl:flex sticky top-0 z-20 items-center h-14 px-8 bg-surface border-b border-border shadow-sm gap-4">
      {/* Left: search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus transition-colors"
          />
        </div>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent-light border border-accent-light-border flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-accent">
                {getInitials(user.full_name)}
              </span>
            </div>
          )}
          <div className="block">
            <p className="text-sm font-medium text-text-primary leading-tight">{user.full_name}</p>
            <p className="text-xs text-text-muted leading-tight">{user.email}</p>
          </div>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            title="Sair"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors active:scale-95"
          >
            <LogOut className="w-5 h-5 shrink-0" />
          </button>
        </form>
      </div>
    </header>
  )
}
