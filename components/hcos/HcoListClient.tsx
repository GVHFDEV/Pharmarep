"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HCO } from '@/types'
import { HCO_CATEGORIES, ITEMS_PER_PAGE } from '@/lib/utils/constants'
import { HcoCard } from './HcoCard'
import { HcoDetailModal } from './HcoDetailModal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { Search } from 'lucide-react'

interface HcoListClientProps {
  refreshKey?: number
}

export function HcoListClient({ refreshKey = 0 }: HcoListClientProps) {
  const [hcos, setHcos] = useState<HCO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [potential, setPotential] = useState('')
  const [selectedHcoId, setSelectedHcoId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const fetchHcos = useCallback(async (reset = false, currentHcos: HCO[] = []) => {
    const supabase = createClient()
    const offset = reset ? 0 : currentHcos.length

    let query = supabase
      .from('hcos')
      .select('*')
      .eq('active', true)
      .order('name')
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (potential) query = query.eq('potential', parseInt(potential))

    if (reset) setLoading(true)
    else setLoadingMore(true)

    const { data, error } = await query

    if (error) {
      toast.error('Erro ao carregar HCOs. Tente novamente.')
      setLoading(false)
      setLoadingMore(false)
      return
    }

    if (data) {
      const updated = reset ? data : [...currentHcos, ...data]
      setHcos(updated as HCO[])
      setHasMore(data.length === ITEMS_PER_PAGE)
    }

    setLoading(false)
    setLoadingMore(false)
  }, [search, category, potential])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchHcos(true, [])
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, potential, refreshKey, detailRefreshKey])

  function handleCardClick(id: string) {
    setSelectedHcoId(id)
    setShowDetail(true)
  }

  function handleDetailClose() {
    setShowDetail(false)
    setSelectedHcoId(null)
  }

  function handleUpdated() {
    setDetailRefreshKey(k => k + 1)
  }

  const categoryOptions = [
    { value: '', label: 'Todas categorias' },
    ...HCO_CATEGORIES.map((c) => ({ value: c, label: c })),
  ]

  const potentialOptions = [
    { value: '', label: 'Todos potenciais' },
    { value: '1', label: 'Potencial 1' },
    { value: '2', label: 'Potencial 2' },
    { value: '3', label: 'Potencial 3' },
  ]

  return (
    <>
      <div className="space-y-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Select options={categoryOptions} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Select options={potentialOptions} value={potential} onChange={(e) => setPotential(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hcos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm">Nenhuma farmácia encontrada</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hcos.map((hco) => (
                <HcoCard key={hco.id} hco={hco} onClick={handleCardClick} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="secondary" onClick={() => fetchHcos(false, hcos)} loading={loadingMore}>
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <HcoDetailModal
        hcoId={selectedHcoId}
        open={showDetail}
        onClose={handleDetailClose}
        onUpdated={handleUpdated}
      />
    </>
  )
}
