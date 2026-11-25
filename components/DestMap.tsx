'use client'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type D = { id: number; name: string; city: string | null; lat: number | null; lng: number | null }

export default function DestMap({ items }: { items: D[] }) {
  return (
    <MapContainer center={[2.9, 98.9]} zoom={8} className="h-80 w-full rounded-2xl">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.filter((d) => d.lat && d.lng).map((d) => (
        <CircleMarker key={d.id} center={[d.lat!, d.lng!]} radius={9}
          pathOptions={{ color: '#0d9488', fillColor: '#f97316', fillOpacity: 0.9 }}>
          <Popup><b>{d.name}</b><br />{d.city}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}