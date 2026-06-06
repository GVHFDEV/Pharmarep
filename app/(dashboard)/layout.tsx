import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import Header from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const userProfile = profile ?? {
    full_name: user.email?.split('@')[0] ?? 'User',
    email: user.email ?? '',
    avatar_url: null,
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={userProfile} />
      {/* md: offset matches collapsed sidebar (72px), lg: offset matches expanded sidebar (260px) */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-[72px] lg:ml-[260px]">
        <Header user={userProfile} />
        <main className="flex-1 p-4 md:p-5 lg:p-8 pb-20 md:pb-5 bg-background overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
