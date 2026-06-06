'use client'

// ONLY loaded via dynamic({ ssr: false }) — no SSR execution.

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, CircleMarker, Marker, useMap, useMapEvents } from 'react-leaflet'
import { cn } from '@/lib/utils/cn'

// Load Leaflet CSS at runtime
if (typeof window !== 'undefined') {
  const linkId = 'leaflet-css'
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
}

export interface MapMarker {
  id: string
  type: 'hcp' | 'hco'
  name: string
  subtitle?: string
  latitude: number
  longitude: number
}

interface Cluster {
  id: string
  latitude: number
  longitude: number
  count: number
  markers: MapMarker[]
}

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
  onMarkerClick?: (marker: MapMarker) => void
}

// Bigger radius scale
function getRadius(zoom: number): number {
  if (zoom <= 4) return 6
  if (zoom <= 6) return 8
  if (zoom <= 8) return 10
  if (zoom <= 10) return 12
  if (zoom <= 12) return 14
  if (zoom <= 14) return 16
  return 18
}

// Cluster distance in degrees based on zoom (lower zoom = bigger cluster radius)
function getClusterDistance(zoom: number): number {
  if (zoom <= 4) return 5      // ~500km
  if (zoom <= 6) return 2      // ~200km
  if (zoom <= 8) return 0.8    // ~80km
  if (zoom <= 10) return 0.3   // ~30km
  return 0 // No clustering at zoom > 10
}

// Simple grid-based clustering
function clusterMarkers(markers: MapMarker[], zoom: number): { clusters: Cluster[]; singles: MapMarker[] } {
  const distance = getClusterDistance(zoom)

  if (distance === 0) {
    return { clusters: [], singles: markers }
  }

  const grid = new Map<string, MapMarker[]>()

  for (const m of markers) {
    const cellX = Math.floor(m.longitude / distance)
    const cellY = Math.floor(m.latitude / distance)
    const key = `${cellX}:${cellY}`
    const cell = grid.get(key) || []
    cell.push(m)
    grid.set(key, cell)
  }

  const clusters: Cluster[] = []
  const singles: MapMarker[] = []

  for (const [key, group] of grid) {
    if (group.length >= 2) {
      // Calculate centroid
      const lat = group.reduce((s, m) => s + m.latitude, 0) / group.length
      const lng = group.reduce((s, m) => s + m.longitude, 0) / group.length
      clusters.push({
        id: `cluster-${key}`,
        latitude: lat,
        longitude: lng,
        count: group.length,
        markers: group,
      })
    } else {
      singles.push(group[0])
    }
  }

  return { clusters, singles }
}

// Create cluster icon with count number
function createClusterIcon(count: number, zoom: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet') as typeof import('leaflet')

  const size = Math.min(24 + Math.log2(count) * 8, 56)
  const fontSize = Math.min(11 + Math.log2(count) * 2, 16)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#08312a" fill-opacity="0.85" stroke="#00e47c" stroke-width="2.5"/>
    <text x="${size / 2}" y="${size / 2 + fontSize / 3}" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="#ffffff">${count}</text>
  </svg>`

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  const prevIdsRef = useRef('')

  useEffect(() => {
    if (markers.length === 0) return
    const ids = markers.map(m => m.id).sort().join(',')
    if (ids === prevIdsRef.current) return
    prevIdsRef.current = ids

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet') as typeof import('leaflet')
    const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]))
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [markers, map])

  return null
}

function ZoomTracker({ onChange }: { onChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onChange(map.getZoom()),
  })
  useEffect(() => onChange(map.getZoom()), [map, onChange])
  return null
}

export default function MapView({
  markers,
  center = [-15.78, -47.93],
  zoom = 5,
  className,
  onMarkerClick,
}: MapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const map = useRef<L.Map | null>(null)

  const handleZoomChange = useCallback((z: number) => {
    setCurrentZoom(z)
  }, [])

  const validMarkers = useMemo(
    () =>
      markers.filter(
        (m) =>
          m.latitude != null &&
          m.longitude != null &&
          !isNaN(m.latitude) &&
          !isNaN(m.longitude) &&
          m.latitude !== 0 &&
          m.longitude !== 0
      ),
    [markers]
  )

  const { clusters, singles } = useMemo(
    () => clusterMarkers(validMarkers, currentZoom),
    [validMarkers, currentZoom]
  )

  const radius = getRadius(currentZoom)

  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className={cn('z-0', className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ZoomTracker onChange={handleZoomChange} />
      {validMarkers.length > 0 && <FitBounds markers={validMarkers} />}

      {/* Render clusters */}
      {clusters.map((cluster) => (
        <Marker
          key={cluster.id}
          position={[cluster.latitude, cluster.longitude]}
          icon={createClusterIcon(cluster.count, currentZoom)}
        />
      ))}

      {/* Render individual markers */}
      {singles.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.latitude, marker.longitude]}
          radius={radius}
          pathOptions={{
            fillColor: marker.type === 'hcp' ? '#08312a' : '#00e47c',
            fillOpacity: 0.9,
            color: marker.type === 'hcp' ? '#ffffff' : '#08312a',
            weight: 2.5,
          }}
          eventHandlers={{ click: () => onMarkerClick?.(marker) }}
        />
      ))}
    </LeafletMapContainer>
  )
}
