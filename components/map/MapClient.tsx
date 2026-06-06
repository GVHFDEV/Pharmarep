'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MapMarker } from './MapContainer'
import { searchAddress, clearGeocodingCache } from '@/lib/utils/geocoding'
import { HcpDetailModal } from '@/components/hcps/HcpDetailModal'
import { HcoDetailModal } from '@/components/hcos/HcoDetailModal'
import { cn } from '@/lib/utils/cn'
import { Users, Building2, MapPin, Loader2, RefreshCw } from 'lucide-react'

const MapView = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-2 flex items-center justify-center rounded-xl">
      <p className="text-text-muted text-sm animate-pulse">Carregando mapa...</p>
    </div>
  ),
})

type FilterType = 'all' | 'hcp' | 'hco'

interface RawHcp {
  id: string
  name: string
  specialty: string
  clinic_address: string | null
  clinic_city: string | null
  clinic_state: string | null
  latitude: number | null
  longitude: number | null
}

interface RawHco {
  id: string
  name: string
  category: string | null
  address: string | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
}

function buildAddressQuery(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(', ')
}

async function geocodeAddress(query: string): Promise<[number, number] | null> {
  if (!query || query.length < 5) return null
  const results = await searchAddress(query)
  if (results.length === 0) return null
  const { latitude, longitude } = results[0]
  if (!latitude || !longitude || latitude === 0 || longitude === 0) return null
  return [latitude, longitude]
}

export default function MapClient() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [geocodingCount, setGeocodingCount] = useState(0)
  const [selectedHcpId, setSelectedHcpId] = useState<string | null>(null)
  const [selectedHcoId, setSelectedHcoId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    if (marker.type === 'hcp') {
      setSelectedHcpId(marker.id)
    } else {
      setSelectedHcoId(marker.id)
    }
  }, [])

  const refreshMarkers = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // Refresh when pathname changes to /map (user navigated here)
  useEffect(() => {
    if (pathname === '/map') {
      refreshMarkers()
    }
  }, [pathname, refreshMarkers])

  // Reload markers on refreshKey change, on page focus, and on visibility change
  useEffect(() => {
    let cancelled = false

    async function loadMarkers() {
      setLoading(true)
      clearGeocodingCache() // Ensure fresh geocoding on every load
      const supabase = createClient()

      const [hcpsRes, hcosRes] = await Promise.all([
        supabase
          .from('hcps')
          .select('id, name, specialty, clinic_address, clinic_city, clinic_state, latitude, longitude')
          .eq('active', true)
          .or('clinic_address.not.is.null,latitude.not.is.null'),
        supabase
          .from('hcos')
          .select('id, name, category, address, city, state, latitude, longitude')
          .eq('active', true)
          .or('address.not.is.null,latitude.not.is.null'),
      ])

      if (cancelled) return

      const hcps: RawHcp[] = hcpsRes.data || []
      const hcos: RawHco[] = hcosRes.data || []

      const resolved: MapMarker[] = []
      const needGeocode: Array<{ record: RawHcp | RawHco; type: 'hcp' | 'hco'; query: string }> = []

      for (const h of hcps) {
        if (h.latitude && h.longitude && h.latitude !== 0 && h.longitude !== 0) {
          resolved.push({
            id: h.id, type: 'hcp', name: h.name,
            subtitle: `${h.specialty}${h.clinic_city ? ` • ${h.clinic_city}` : ''}`,
            latitude: h.latitude, longitude: h.longitude,
          })
        } else {
          const query = buildAddressQuery([h.clinic_address, h.clinic_city, h.clinic_state, 'Brasil'])
          if (query.length > 5) needGeocode.push({ record: h, type: 'hcp', query })
        }
      }

      for (const h of hcos) {
        if (h.latitude && h.longitude && h.latitude !== 0 && h.longitude !== 0) {
          resolved.push({
            id: h.id, type: 'hco', name: h.name,
            subtitle: `${h.category || 'Farmácia'}${h.city ? ` • ${h.city}` : ''}`,
            latitude: h.latitude, longitude: h.longitude,
          })
        } else {
          const query = buildAddressQuery([h.address, h.city, h.state, 'Brasil'])
          if (query.length > 5) needGeocode.push({ record: h, type: 'hco', query })
        }
      }

      setMarkers(resolved)
      setLoading(false)

      // Geocode remaining
      if (needGeocode.length > 0) {
        setGeocodingCount(needGeocode.length)

        for (const item of needGeocode) {
          if (cancelled) break
          const coords = await geocodeAddress(item.query)

          if (coords && !cancelled) {
            const [lat, lng] = coords
            const h = item.record

            const marker: MapMarker = item.type === 'hcp'
              ? {
                  id: h.id, type: 'hcp', name: h.name,
                  subtitle: `${(h as RawHcp).specialty}${(h as RawHcp).clinic_city ? ` • ${(h as RawHcp).clinic_city}` : ''}`,
                  latitude: lat, longitude: lng,
                }
              : {
                  id: h.id, type: 'hco', name: h.name,
                  subtitle: `${(h as RawHco).category || 'Farmácia'}${(h as RawHco).city ? ` • ${(h as RawHco).city}` : ''}`,
                  latitude: lat, longitude: lng,
                }

            setMarkers((prev) => [...prev, marker])

            // Persist to DB
            const table = item.type === 'hcp' ? 'hcps' : 'hcos'
            supabase.from(table).update({ latitude: lat, longitude: lng }).eq('id', h.id).then(() => {})
          }

          setGeocodingCount((c) => Math.max(c - 1, 0))
          await new Promise((r) => setTimeout(r, 1100))
        }
        setGeocodingCount(0)
      }
    }

    loadMarkers()

    return () => { cancelled = true }
  }, [refreshKey])

  // Refresh on window focus (user edited something, came back)
  useEffect(() => {
    function handleFocus() {
      refreshMarkers()
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') refreshMarkers()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refreshMarkers])

  const filteredMarkers = useMemo(() => {
    if (filter === 'all') return markers
    return markers.filter((m) => m.type === filter)
  }, [markers, filter])

  const hcpCount = markers.filter((m) => m.type === 'hcp').length
  const hcoCount = markers.filter((m) => m.type === 'hco').length

  return (
    <div className="flex flex-col h-full">
      {/* Header / Filters */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-green" />
          <h1 className="text-lg font-bold text-text-primary">Mapa</h1>
          {loading ? (
            <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          ) : geocodingCount > 0 ? (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              geocodificando {geocodingCount}...
            </span>
          ) : (
            <span className="text-xs text-text-muted">{filteredMarkers.length} marcadores</span>
          )}
          <button
            type="button"
            onClick={refreshMarkers}
            className="p-1 rounded-md hover:bg-surface-2 transition-colors"
            title="Atualizar mapa"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>

        <div className="flex gap-1.5">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            icon={<MapPin className="w-3.5 h-3.5" />}
            label={`Todos (${markers.length})`}
          />
          <FilterButton
            active={filter === 'hcp'}
            onClick={() => setFilter('hcp')}
            icon={<Users className="w-3.5 h-3.5" />}
            label={`HCPs (${hcpCount})`}
          />
          <FilterButton
            active={filter === 'hco'}
            onClick={() => setFilter('hco')}
            icon={<Building2 className="w-3.5 h-3.5" />}
            label={`HCOs (${hcoCount})`}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[400px] rounded-xl overflow-hidden border border-border shadow-sm">
        {loading ? (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <p className="text-text-muted text-sm animate-pulse">Carregando...</p>
          </div>
        ) : (
          <MapView
            markers={filteredMarkers}
            className="h-full w-full"
            onMarkerClick={handleMarkerClick}
          />
        )}
      </div>

      {/* Detail Modals */}
      <HcpDetailModal
        hcpId={selectedHcpId}
        open={!!selectedHcpId}
        onClose={() => setSelectedHcpId(null)}
        onUpdated={refreshMarkers}
      />
      <HcoDetailModal
        hcoId={selectedHcoId}
        open={!!selectedHcoId}
        onClose={() => setSelectedHcoId(null)}
        onUpdated={refreshMarkers}
      />
    </div>
  )
}

function FilterButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
