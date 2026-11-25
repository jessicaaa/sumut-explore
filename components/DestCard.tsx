import Link from 'next/link'
import { Clock, MapPin, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Weather from './Weather'
import { budget } from '@/lib/format'

export default function DestCard({ d }: { d: any }) {
  const photo: string | undefined = d.photos?.[0]
  return (
    <Link href={`/destinasi/${d.slug}`} className="block">
      <Card className="group gap-0 overflow-hidden py-0 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-teal-600 to-sky-700">
          {photo && (
            <img src={photo} alt={d.name} loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          )}
          <Badge variant="secondary" className="absolute left-3 top-3 capitalize">{d.category ?? 'wisata'}</Badge>
        </div>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-lg font-semibold leading-snug">{d.name}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />{d.city}
          </p>
          <p className="line-clamp-2 text-sm">{d.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{budget(d.budget_min, d.budget_max)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.open_hours ?? '-'}</span>
          </div>
          {d.lat && d.lng && <div className="text-sm"><Weather lat={d.lat} lng={d.lng} /></div>}
        </CardContent>
      </Card>
    </Link>
  )
}