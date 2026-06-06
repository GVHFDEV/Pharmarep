import MapClient from '@/components/map/MapClient'

export const metadata = {
  title: 'Mapa | PharmaRep CRM',
}

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)]" suppressHydrationWarning>
      <MapClient />
    </div>
  )
}
