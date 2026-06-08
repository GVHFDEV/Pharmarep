import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subWeeks } from 'date-fns'
import { DashboardCharts } from '@/components/stats/DashboardCharts'
import { AnimatedDashboardCards } from '@/components/stats/AnimatedDashboardCards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()

  // Fetch all metrics in parallel
  const [hcpsResult, inactiveHcpsResult, visitsMonthResult, completedResult, pendingTodayResult, eventsMonthResult] = await Promise.all([
    supabase.from('hcps').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('hcps').select('id', { count: 'exact', head: true }).eq('active', false),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('scheduled_at', monthStart).lte('scheduled_at', monthEnd),
    supabase.from('visits').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('scheduled_at', monthStart).lte('scheduled_at', monthEnd),
    supabase.from('visits').select('id', { count: 'exact', head: true }).eq('status', 'scheduled').gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
    supabase.from('events').select('id', { count: 'exact', head: true }).gte('scheduled_at', monthStart).lte('scheduled_at', monthEnd),
  ])

  const totalHcps = hcpsResult.count ?? 0
  const inactiveHcps = inactiveHcpsResult.count ?? 0
  const visitsThisMonth = visitsMonthResult.count ?? 0
  const completedThisMonth = completedResult.count ?? 0
  const pendingToday = pendingTodayResult.count ?? 0
  const eventsThisMonth = eventsMonthResult.count ?? 0

  // Fetch visit data for charts (last 4 weeks)
  const fourWeeksAgo = subWeeks(now, 4).toISOString()
  const { data: recentVisits } = await supabase
    .from('visits')
    .select('scheduled_at, status')
    .gte('scheduled_at', fourWeeksAgo)

  // Fetch HCP potential distribution
  const { data: hcpPotentials } = await supabase
    .from('hcps')
    .select('potential')
    .eq('active', true)

  // Fetch HCP specialties for chart
  const { data: hcpSpecialties } = await supabase
    .from('hcps')
    .select('id, specialty')
    .eq('active', true)

  // Top 5 most visited HCPs this month
  const { data: topHcps } = await supabase
    .from('visits')
    .select('hcp_id, hcps(name)')
    .eq('status', 'completed')
    .gte('scheduled_at', monthStart)
    .lte('scheduled_at', monthEnd)

  // Top 3 promoted products this month
  const { data: topProducts } = await supabase
    .from('visit_products')
    .select('product_id, products(name), samples_delivered')

  return (
    <div className="space-y-6">
      {/* Summary Cards — only plain numbers passed, icons defined inside the client component */}
      <AnimatedDashboardCards
        totalHcps={totalHcps}
        inactiveHcps={inactiveHcps}
        visitsThisMonth={visitsThisMonth}
        completedThisMonth={completedThisMonth}
        pendingToday={pendingToday}
        eventsThisMonth={eventsThisMonth}
      />

      {/* Charts section - Client component for Recharts */}
      <DashboardCharts
        recentVisits={recentVisits ?? []}
        hcpPotentials={hcpPotentials ?? []}
        hcpSpecialties={(hcpSpecialties ?? []) as Array<{ id: string; specialty: string }>}
        topHcps={(topHcps ?? []) as unknown as Array<{ hcp_id: string; hcps: { name: string } | null }>}
        topProducts={(topProducts ?? []) as unknown as Array<{ product_id: string; products: { name: string } | null; samples_delivered: number }>}
      />
    </div>
  )
}
