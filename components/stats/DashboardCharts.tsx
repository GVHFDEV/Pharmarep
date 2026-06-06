"use client"

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts'
import { startOfWeek, format, parseISO, isWithinInterval, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Trophy, Package, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface DashboardChartsProps {
  recentVisits: Array<{ scheduled_at: string; status: string }>
  hcpPotentials: Array<{ potential: number | null }>
  topHcps: Array<{ hcp_id: string; hcps: { name: string } | null }>
  topProducts: Array<{ product_id: string; products: { name: string } | null; samples_delivered: number }>
}

const PIE_COLORS = ['#08312a', '#00e47c', '#94a3b8']

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn('bg-surface border border-border rounded-2xl p-5 shadow-sm', className)}
    >
      {children}
    </motion.div>
  )
}

export function DashboardCharts({ recentVisits, hcpPotentials, topHcps, topProducts }: DashboardChartsProps) {
  const now = new Date()

  // Weekly visits for area chart
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 })
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    const wv = recentVisits.filter(v => {
      const d = parseISO(v.scheduled_at)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    })
    return {
      name: format(weekStart, 'dd/MM', { locale: ptBR }),
      total: wv.length,
      concluídas: wv.filter(v => v.status === 'completed').length,
    }
  })

  // Potential distribution for donut
  const potentialData = [
    { name: 'Pot. 1', value: hcpPotentials.filter(h => h.potential === 1).length },
    { name: 'Pot. 2', value: hcpPotentials.filter(h => h.potential === 2).length },
    { name: 'Pot. 3', value: hcpPotentials.filter(h => h.potential === 3).length },
  ].filter(d => d.value > 0)

  const totalPotential = potentialData.reduce((s, d) => s + d.value, 0)

  // Top HCPs
  const hcpCounts: Record<string, { name: string; count: number }> = {}
  for (const v of topHcps) {
    const name = v.hcps?.name ?? 'Desconhecido'
    if (!hcpCounts[v.hcp_id]) hcpCounts[v.hcp_id] = { name, count: 0 }
    hcpCounts[v.hcp_id].count++
  }
  const topHcpList = Object.values(hcpCounts).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxVisits = topHcpList[0]?.count || 1

  // Top products
  const productCounts: Record<string, { name: string; count: number }> = {}
  for (const vp of topProducts) {
    const name = vp.products?.name ?? 'Desconhecido'
    if (!productCounts[vp.product_id]) productCounts[vp.product_id] = { name, count: 0 }
    productCounts[vp.product_id].count += vp.samples_delivered
  }
  const topProductList = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 3)

  // Total visits for the area chart header
  const totalVisits = weeklyData.reduce((s, w) => s + w.total, 0)
  const completedVisits = weeklyData.reduce((s, w) => s + w.concluídas, 0)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* ── Left column (2/3) ── */}
      <div className="xl:col-span-2 flex flex-col gap-4">

        {/* Area chart — visits analytics */}
        <SectionCard>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Visitas Analíticas</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-text-primary">{totalVisits}</span>
                <span className="text-sm text-success font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {completedVisits} concluídas
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                Total
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green inline-block" />
                Concluídas
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#08312a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#08312a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConcluidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e47c" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e47c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde3ea" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#08312a" strokeWidth={2} fill="url(#gradTotal)" dot={false} name="Total" />
              <Area type="monotone" dataKey="concluídas" stroke="#00e47c" strokeWidth={2} fill="url(#gradConcluidas)" dot={false} name="Concluídas" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Top HCPs table-style */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <p className="text-sm font-semibold text-text-primary">Top HCPs Mais Visitados</p>
            </div>
            <Link href="/hcps" className="flex items-center gap-1 text-xs text-accent hover:underline">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topHcpList.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">Nenhuma visita concluída este mês</p>
          ) : (
            <div className="space-y-3">
              {topHcpList.map((hcp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-accent-light text-accent text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-text-primary font-medium truncate">{hcp.name}</p>
                      <span className="text-xs text-text-muted ml-2 shrink-0">{hcp.count} visitas</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(hcp.count / maxVisits) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Right column (1/3) ── */}
      <div className="flex flex-col gap-4">

        {/* Donut — HCP por potencial */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-text-primary">Distribuição HCPs</p>
          </div>
          {potentialData.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">Nenhum HCP com potencial definido</p>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={potentialData}
                      dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      strokeWidth={2}
                      stroke="#f0f4f8"
                    >
                      {potentialData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-text-primary">{totalPotential}</p>
                  <p className="text-[10px] text-text-muted">HCPs</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {potentialData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-text-secondary">{d.name}</span>
                    </div>
                    <span className="font-semibold text-text-primary">
                      {totalPotential > 0 ? Math.round((d.value / totalPotential) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        {/* Bar chart — visits per week (compact) */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-text-primary">Visitas / Semana</p>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={weeklyData.slice(-4)} barSize={14} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" fill="#08312a" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="concluídas" fill="#00e47c" radius={[4, 4, 0, 0]} name="Concluídas" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Top products */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-text-primary">Produtos Propagandeados</p>
          </div>
          {topProductList.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Nenhum produto registrado</p>
          ) : (
            <div className="space-y-3">
              {topProductList.map((prod, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-brand-green shrink-0" />
                    <p className="text-sm text-text-primary truncate">{prod.name}</p>
                  </div>
                  <span className="text-xs font-semibold text-accent ml-2 shrink-0">{prod.count} amostras</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
