import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CalendarDays, MapPin, Users, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PlanAction from '@/components/PlanAction'
import ShareButton from '@/components/ShareButton'
import WeatherForecast from '@/components/WeatherForecast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { rentang, rupiah } from '@/lib/format'

const loadPlan = cache(async (id: string) => {
  const n = Number(id)
  if (!Number.isInteger(n)) return null
  const supabase = await createClient()
  const { data: plan } = await supabase.from('plans_view').select('*').eq('id', n).maybeSingle()
  if (!plan) return null
  const { data: dest } = plan.destination_id
    ? await supabase.from('destinations').select('id,name,slug,city,lat,lng,photos').eq('id', plan.destination_id).maybeSingle()
    : { data: null }
  return { plan, dest }
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await loadPlan((await params).id)
  if (!r) return { title: 'Rencana tidak ditemukan' }
  const description = `${r.dest?.name ?? 'Sumatera Utara'} · ${rentang(r.plan.start_date, r.plan.end_date)} · cari teman jalan di SumUt Explore`
  return {
    title: r.plan.title,
    description,
    openGraph: { title: r.plan.title, description, images: r.dest?.photos?.[0] ? [r.dest.photos[0]] : undefined },
  }
}

export default async function PlanDetail({ params }: { params: Promise<{ id: string }> }) {
  const r = await loadPlan((await params).id)
  if (!r) notFound()
  const { plan, dest } = r

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let myStatus: string | null = null
  let people: { full_name: string; is_creator: boolean }[] = []
  if (user) {
    const [{ data: mine }, { data: ppl }] = await Promise.all([
      supabase.from('join_requests').select('status').eq('plan_id', plan.id).eq('requester_id', user.id).maybeSingle(),
      supabase.rpc('plan_people', { p_plan: plan.id }),
    ])
    myStatus = mine?.status && mine.status !== 'cancelled' ? mine.status : null
    people = ppl ?? []
  }

  const state = plan.effective_status
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          {state === 'completed' ? <Badge variant="secondary">Selesai</Badge>
            : state === 'closed' ? <Badge variant="secondary">Ditutup</Badge>
            : plan.approved_count >= plan.max_buddies ? <Badge variant="secondary">Penuh</Badge>
            : <Badge>Terbuka</Badge>}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{plan.title}</h1>
        {dest && (
          <Link href={`/destinasi/${dest.slug}`} className="mt-1 inline-flex items-center gap-1 text-primary hover:underline">
            <MapPin className="h-4 w-4" />{dest.name}{dest.city ? `, ${dest.city}` : ''}
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{rentang(plan.start_date, plan.end_date)}</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{plan.approved_count}/{plan.max_buddies} teman</span>
            {plan.budget_per_person && <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />{rupiah(plan.budget_per_person)} / orang</span>}
          </div>
          {plan.description && <p className="whitespace-pre-line text-muted-foreground">{plan.description}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <PlanAction plan={plan} userId={user?.id} myStatus={myStatus} />
            {state === 'open' && <ShareButton id={plan.id} title={plan.title} />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Peserta</CardTitle></CardHeader>
        <CardContent>
          {!user ? (
            <p className="text-sm text-muted-foreground"><Link href={`/login?next=/rencana/${plan.id}`} className="text-primary underline">Masuk</Link> untuk melihat peserta.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {people.map((p, i) => (
                <li key={i} className="flex items-center gap-2">{p.full_name}{p.is_creator && <Badge variant="outline">Pembuat</Badge>}</li>
              ))}
              {people.length <= 1 && <li className="text-muted-foreground">Belum ada peserta lain.</li>}
            </ul>
          )}
        </CardContent>
      </Card>

      {dest?.lat && dest?.lng && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Cuaca pada tanggal perjalanan</h2>
          <WeatherForecast lat={dest.lat} lng={dest.lng} from={plan.start_date} to={plan.end_date} />
        </section>
      )}
    </div>
  )
}