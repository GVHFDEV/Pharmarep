import MapClient from '@/components/map/MapClient'

export const metadata = {
  title: 'Mapa | PharmaRep CRM',
}

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-10rem)] xl:h-[calc(100vh-7rem)]" suppressHydrationWarning>
      <MapClient />
    </div>
  )
}
