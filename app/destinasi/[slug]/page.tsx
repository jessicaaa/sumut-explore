import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, ExternalLink, MapPin, ShieldCheck, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/PlanCard'
import WeatherForecast from '@/components/WeatherForecast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { budget } from '@/lib/format'
import { DAYS, todayStr } from '@/lib/config'

const loadDest = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from('destinations').select('*').eq('slug', slug).eq('status', 'verified').maybeSingle()
  return data
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = await loadDest((await params).slug)
  if (!d) return { title: 'Destinasi tidak ditemukan' }
  const description = (d.description ?? '').slice(0, 160)
  return {
    title: d.name,
    description,
    openGraph: { title: d.name, description, images: d.photos?.[0] ? [d.photos[0]] : undefined },
  }
}

export default async function DestDetail({ params }: { params: Promise<{ slug: string }> }) {
  const d = await loadDest((await params).slug)
  if (!d) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: plans } = await supabase.from('plans_view').select('*')
    .eq('destination_id', d.id).in('effective_status', ['open', 'closed'])
    .gte('start_date', todayStr()).order('start_date')

  const photos: string[] = d.photos ?? []
  const mapsUrl = d.maps_url ?? (d.lat && d.lng ? `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}` : null)
  const hours = d.opening_hours as Record<string, string> | null
  const todayIdx = (new Date().getDay() + 6) % 7

  return (
    <div className="space-y-10">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />Terverifikasi</Badge>
          <Badge variant="secondary" className="capitalize">{d.category}</Badge>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{d.name}</h1>
        <p className="mt-1 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{d.address ?? d.city}</p>
      </div>

      {photos.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-3">
          <img src={photos[0]} alt={d.name} className="aspect-video w-full rounded-2xl object-cover md:col-span-2 md:row-span-2 md:h-full" />
          {photos.slice(1, 3).map((p) => <img key={p} src={p} alt="" loading="lazy" className="aspect-video w-full rounded-2xl object-cover" />)}
        </div>
      ) : (
        <div className="aspect-[21/8] rounded-2xl bg-gradient-to-br from-teal-600 to-sky-700" />
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <h2 className="text-lg font-semibold">Tentang</h2>
          <p className="whitespace-pre-line text-muted-foreground">{d.description}</p>
        </div>
        <Card>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />{budget(d.budget_min, d.budget_max)}</p>
            {!hours && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{d.open_hours ?? 'Jam buka belum ada'}</p>}
            {mapsUrl && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={mapsUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-4 w-4" />Buka di Google Maps</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {hours && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Jam buka</h2>
          <div className="grid gap-1 rounded-2xl border bg-card p-4 sm:grid-cols-2">
            {DAYS.map((day, i) => (
              <div key={day} className={`flex justify-between rounded-md px-3 py-1.5 text-sm ${i === todayIdx ? 'bg-primary/10 font-medium text-primary' : ''}`}>
                <span className="capitalize">{day}</span><span>{hours[day] || 'Tutup'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {d.lat && d.lng && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Cuaca 5 hari ke depan</h2>
          <WeatherForecast lat={d.lat} lng={d.lng} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Rencana ke {d.name}</h2>
        {plans?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((p) => <PlanCard key={p.id} p={p} destName={d.name} isMine={p.creator_id === user?.id} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada rencana ke sini. Jadi yang pertama.</p>
        )}
      </section>
    </div>
  )
}