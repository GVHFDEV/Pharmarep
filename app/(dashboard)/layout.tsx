import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'
import { cache } from 'react'

// Cache user fetch per request — avoids duplicate getUser() calls
// when proxy already validated the session
const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', userId)
    .single()
  return profile
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  const userProfile = profile ?? {
    full_name: user.email?.split('@')[0] ?? 'User',
    email: user.email ?? '',
    avatar_url: null,
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar: desktop only (xl+) */}
      <Sidebar user={userProfile} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen xl:ml-[72px] 2xl:ml-[260px]">
        {/* Header: desktop only (xl+) */}
        <Header user={userProfile} />
        <main className="flex-1 pt-10 px-4 pb-28 xl:pt-6 xl:px-8 xl:pb-5 bg-background overflow-y-auto">
          {children}
        </main>
        {/* BottomNav: tablet + mobile only (hidden xl+) */}
        <BottomNav />
      </div>
    </div>
  )
}
