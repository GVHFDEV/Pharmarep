"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResponsiveModal } from '@/components/ui/ResponsiveModal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { MapPin, Plus, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { GeocodingResult } from '@/lib/utils/geocoding'

interface SavedLocation {
  id: string
  name: string
  address: string | null
  city: string | null
}

interface LocationPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (locationText: string) => void
  currentValue?: string
}

export function LocationPickerModal({ open, onClose, onSelect, currentValue }: LocationPickerModalProps) {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newCity, setNewCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetchLocations()
  }, [open])

  async function fetchLocations() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('event_locations')
      .select('id, name, address, city')
      .order('name')
    if (data) setLocations(data)
    setLoading(false)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data, error } = await supabase.from('event_locations').insert({
      user_id: user.id,
      name: newName.trim(),
      address: newAddress.trim() || null,
      city: newCity.trim() || null,
    }).select('id, name, address, city').single()

    if (!error && data) {
      setLocations(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      const text = buildLocationText(data)
      onSelect(text)
      onClose()
    }
    setSaving(false)
    setShowCreate(false)
    setNewName('')
    setNewAddress('')
    setNewCity('')
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('event_locations').delete().eq('id', id)
    setLocations(prev => prev.filter(l => l.id !== id))
    setDeletingId(null)
  }

  function buildLocationText(loc: SavedLocation) {
    return [loc.name, loc.address, loc.city].filter(Boolean).join(' – ')
  }

  function handleSelectLocation(loc: SavedLocation) {
    onSelect(buildLocationText(loc))
    onClose()
  }

  function handleAddressSelect(result: GeocodingResult) {
    setNewAddress(result.address.street || result.displayName.split(',')[0])
    setNewCity(result.address.city)
  }

  const filtered = locations.filter(loc =>
    loc.name.toLowerCase().includes(search.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(search.toLowerCase())) ||
    (loc.city && loc.city.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <ResponsiveModal open={open} onClose={onClose} title="Selecionar Local" size="sm" scrollable>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar local..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-border-focus"
          />
        </div>

        {/* Location list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 && !showCreate ? (
          <div className="text-center py-6">
            <MapPin className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              {search ? 'Nenhum local encontrado' : 'Nenhum local salvo'}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {filtered.map((loc) => (
              <div key={loc.id} className="flex items-center gap-2 group">
                <button
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{loc.name}</p>
                    {(loc.address || loc.city) && (
                      <p className="text-xs text-text-muted truncate">
                        {[loc.address, loc.city].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(loc.id)}
                  disabled={deletingId === loc.id}
                  className="p-2 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create new location */}
        {showCreate ? (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-surface-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Novo Local</p>
            <Input
              id="loc-name"
              label="Nome *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Hotel Grand Hyatt"
            />
            <AddressAutocomplete
              label="Endereço"
              value={newAddress}
              onChange={(val) => setNewAddress(val)}
              onSelect={handleAddressSelect}
              placeholder="Buscar endereço ou CEP..."
            />
            <Input
              id="loc-city"
              label="Cidade"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="São Paulo"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving} className="flex-1">
                Salvar
              </Button>
              <Button variant="secondary" onClick={() => { setShowCreate(false); setNewName(''); setNewAddress(''); setNewCity('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Novo Local
          </button>
        )}
      </div>
    </ResponsiveModal>
  )
}
