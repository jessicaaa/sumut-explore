import Link from 'next/link'
import { ArrowRight, CalendarPlus, Search, ShieldCheck, Store, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import DestCard from '@/components/DestCard'
import PlanCard from '@/components/PlanCard'
import { todayStr } from '@/lib/config'

const steps = [
  { icon: CalendarPlus, title: 'Buat atau temukan rencana', text: 'Pilih destinasi dan tanggal, atau cari rencana orang lain yang cocok denganmu.' },
  { icon: UserCheck, title: 'Ajukan gabung', text: 'Kirim permintaan. Pembuat rencana yang memutuskan menerima atau tidak.' },
  { icon: ShieldCheck, title: 'Kontak terbuka setelah disetujui', text: 'WhatsApp dan Instagram hanya terlihat setelah ada persetujuan.' },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: dests }, { data: plans }] = await Promise.all([
    supabase.from('destinations').select('*').eq('status', 'verified').limit(100),
    supabase.from('plans_view').select('*').eq('effective_status', 'open')
      .gte('start_date', todayStr()).order('created_at', { ascending: false }).limit(60),
  ])

  const count = new Map<number, number>()
  plans?.forEach((p) => p.destination_id && count.set(p.destination_id, (count.get(p.destination_id) ?? 0) + 1))
  const popular = [...(dests ?? [])].sort((a, b) => (count.get(b.id) ?? 0) - (count.get(a.id) ?? 0)).slice(0, 3)
  const nameOf = (id: number) => dests?.find((d) => d.id === id)?.name

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-sky-700 px-6 py-16 text-center text-white md:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          Jelajahi Sumatera Utara, tidak harus sendirian
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-teal-50">
          Info destinasi, rencana perjalanan, dan teman jalan yang cocok, dengan kontak yang aman.
        </p>
        <form action="/destinasi" className="mx-auto mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-xl">
          <Input name="q" placeholder="Cari destinasi atau kota…"
            className="border-0 bg-transparent text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:ring-0" />
          <Button type="submit" className="bg-cta text-cta-foreground hover:bg-cta/90">
            <Search className="mr-1 h-4 w-4" />Cari
          </Button>
        </form>
        <div className="mt-6"><Button asChild variant="secondary"><Link href="/rencana">Cari teman jalan</Link></Button></div>
      </section>

      {popular.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Destinasi populer</h2>
            <Link href="/destinasi" className="flex items-center gap-1 text-sm text-primary hover:underline">Lihat semua<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{popular.map((d) => <DestCard key={d.id} d={d} />)}</div>
        </section>
      )}

      {plans && plans.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Rencana terbaru</h2>
            <Link href="/rencana" className="flex items-center gap-1 text-sm text-primary hover:underline">Lihat semua<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.slice(0, 4).map((p) => (
              <PlanCard key={p.id} p={p} destName={nameOf(p.destination_id)} isMine={p.creator_id === user?.id} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold">Cara kerjanya</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title}>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold text-muted-foreground">Langkah {i + 1}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-3xl border bg-card p-8 text-center md:flex-row md:text-left">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cta/15 text-cta"><Store className="h-7 w-7" /></span>
        <div className="flex-1">
          <h2 className="text-xl font-bold">Punya tempat wisata?</h2>
          <p className="text-muted-foreground">Daftarkan gratis dan jangkau traveler dari seluruh Sumatera Utara.</p>
        </div>
        <Button asChild className="bg-cta text-cta-foreground hover:bg-cta/90"><Link href="/login">Daftar sebagai pemilik</Link></Button>
      </section>
    </div>
  )
}