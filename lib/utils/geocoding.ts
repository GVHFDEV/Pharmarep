/**
 * Geocoding utilities — Nominatim (OpenStreetMap) + ViaCEP fallback.
 * - Autocomplete search with debounce
 * - CEP lookup via ViaCEP + Nominatim for coordinates
 * - Reverse geocoding
 * - Client-side LRU cache
 */

export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    city_district?: string
    state?: string
    postcode?: string
    country?: string
    [key: string]: string | undefined
  }
}

export interface ViaCepResult {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface GeocodingResult {
  displayName: string
  latitude: number
  longitude: number
  address: {
    street: string
    neighborhood: string
    city: string
    state: string
    zip: string
  }
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

// LRU cache (max 200 entries)
const cache = new Map<string, GeocodingResult[]>()
const CACHE_MAX = 200

/** Clears entire geocoding cache — call before re-geocoding after edits */
export function clearGeocodingCache() {
  cache.clear()
}

function cacheSet(key: string, value: GeocodingResult[]) {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, value)
}

function cacheGet(key: string): GeocodingResult[] | undefined {
  const val = cache.get(key)
  if (val) {
    cache.delete(key)
    cache.set(key, val)
  }
  return val
}

/**
 * Check if input looks like a CEP (8 digits, with or without dash).
 */
function extractCep(input: string): string | null {
  const clean = input.replace(/\D/g, '')
  if (clean.length === 8) return clean
  return null
}

/**
 * Lookup CEP via ViaCEP + get coordinates from Nominatim.
 */
export async function searchByCep(cep: string): Promise<GeocodingResult[]> {
  const cleanCep = cep.replace(/\D/g, '')
  if (cleanCep.length !== 8) return []

  const cacheKey = `cep:${cleanCep}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    // 1. Get address from ViaCEP
    const viaRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!viaRes.ok) return []
    const viaData: ViaCepResult = await viaRes.json()
    if (viaData.erro) return []

    // 2. Get coordinates from Nominatim using the address
    const searchQuery = [viaData.logradouro, viaData.bairro, viaData.localidade, viaData.uf]
      .filter(Boolean)
      .join(', ')

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'br',
    })

    const nomRes = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { 'Accept-Language': 'pt-BR,pt' },
    })

    let latitude = 0
    let longitude = 0

    if (nomRes.ok) {
      const nomData: NominatimResult[] = await nomRes.json()
      if (nomData.length > 0) {
        latitude = parseFloat(nomData[0].lat)
        longitude = parseFloat(nomData[0].lon)
      }
    }

    const result: GeocodingResult = {
      displayName: `${viaData.logradouro}, ${viaData.bairro}, ${viaData.localidade} - ${viaData.uf}`,
      latitude,
      longitude,
      address: {
        street: viaData.logradouro,
        neighborhood: viaData.bairro,
        city: viaData.localidade,
        state: viaData.uf,
        zip: viaData.cep.replace(/\D/g, ''),
      },
    }

    const results = [result]
    cacheSet(cacheKey, results)
    return results
  } catch {
    return []
  }
}

/**
 * Search addresses via Nominatim. If input is a CEP, uses ViaCEP first.
 */
export async function searchAddress(query: string, countryCode = 'br'): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) return []

  // Check if it's a CEP
  const cep = extractCep(query)
  if (cep) return searchByCep(cep)

  const cacheKey = `${countryCode}:${query.toLowerCase().trim()}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      countrycodes: countryCode,
    })

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { 'Accept-Language': 'pt-BR,pt' },
    })

    if (!res.ok) return []

    const data: NominatimResult[] = await res.json()

    const results: GeocodingResult[] = data.map((item) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: {
        street: [item.address.road, item.address.house_number].filter(Boolean).join(', '),
        neighborhood: item.address.suburb || item.address.neighbourhood || '',
        city: item.address.city || item.address.town || item.address.city_district || '',
        state: item.address.state || '',
        zip: item.address.postcode || '',
      },
    }))

    cacheSet(cacheKey, results)
    return results
  } catch {
    return []
  }
}

/**
 * Reverse geocode lat/lng to address.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      addressdetails: '1',
    })

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'Accept-Language': 'pt-BR,pt' },
    })

    if (!res.ok) return null

    const item: NominatimResult = await res.json()

    return {
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: {
        street: [item.address.road, item.address.house_number].filter(Boolean).join(', '),
        neighborhood: item.address.suburb || item.address.neighbourhood || '',
        city: item.address.city || item.address.town || item.address.city_district || '',
        state: item.address.state || '',
        zip: item.address.postcode || '',
      },
    }
  } catch {
    return null
  }
}
