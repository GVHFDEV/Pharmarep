"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HCP } from '@/types'
import { SPECIALTIES, ITEMS_PER_PAGE } from '@/lib/utils/constants'
import { HcpCard } from './HcpCard'
import { HcpDetailModal } from './HcpDetailModal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Search } from 'lucide-react'

interface HcpListClientProps {
  refreshKey?: number
}

export function HcpListClient({ refreshKey = 0 }: HcpListClientProps) {
  const [hcps, setHcps] = useState<HCP[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [potential, setPotential] = useState('')
  const [selectedHcpId, setSelectedHcpId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const fetchHcps = useCallback(async (reset = false, currentHcps: HCP[] = []) => {
    const supabase = createClient()
    const offset = reset ? 0 : currentHcps.length

    let query = supabase
      .from('hcps')
      .select('*')
      .eq('active', true)
      .order('name')
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (search) query = query.ilike('name', `%${search}%`)
    if (specialty) query = query.eq('specialty', specialty)
    if (potential) query = query.eq('potential', parseInt(potential))

    if (reset) setLoading(true)
    else setLoadingMore(true)

    const { data, error } = await query

    if (error) {
      toast.error('Erro ao carregar HCPs. Tente novamente.')
      setLoading(false)
      setLoadingMore(false)
      return
    }

    if (data) {
      const updated = reset ? data : [...currentHcps, ...data]
      setHcps(updated as HCP[])
      setHasMore(data.length === ITEMS_PER_PAGE)
    }

    setLoading(false)
    setLoadingMore(false)
  }, [search, specialty, potential])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchHcps(true, [])
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, specialty, potential, refreshKey, detailRefreshKey])

  function handleCardClick(id: string) {
    setSelectedHcpId(id)
    setShowDetail(true)
  }

  function handleDetailClose() {
    setShowDetail(false)
    setSelectedHcpId(null)
  }

  function handleUpdated() {
    setDetailRefreshKey(k => k + 1)
  }

  const specialtyOptions = [
    { value: '', label: 'Todas especialidades' },
    ...SPECIALTIES.map((s) => ({ value: s, label: s })),
  ]

  const potentialOptions = [
    { value: '', label: 'Todos potenciais' },
    { value: '1', label: 'Potencial 1' },
    { value: '2', label: 'Potencial 2' },
    { value: '3', label: 'Potencial 3' },
    { value: '4', label: 'Potencial 4' },
    { value: '5', label: 'Potencial 5' },
    { value: '6', label: 'Potencial 6' },
  ]

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select options={specialtyOptions} value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          <Select options={potentialOptions} value={potential} onChange={(e) => setPotential(e.target.value)} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hcps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">Nenhum HCP encontrado</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hcps.map((hcp) => (
                <HcpCard key={hcp.id} hcp={hcp} onClick={handleCardClick} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="secondary" onClick={() => fetchHcps(false, hcps)} loading={loadingMore}>
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* HCP Detail / Edit Modal */}
      <HcpDetailModal
        hcpId={selectedHcpId}
        open={showDetail}
        onClose={handleDetailClose}
        onUpdated={handleUpdated}
      />
    </>
  )
}
