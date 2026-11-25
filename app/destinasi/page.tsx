import Link from 'next/link'
import { Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DestCard from '@/components/DestCard'
import DestMapLoader from '@/components/DestMapLoader'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/lib/config'
import { field } from '@/lib/ui'

export const metadata = { title: 'Destinasi' }

type SP = { q?: string; kota?: string; kategori?: string; budget?: string; urut?: string }

export default async function Destinasi({ searchParams }: { searchParams: Promise<SP> }) {
  const { q, kota, kategori, budget, urut } = await searchParams
  const supabase = await createClient()

  const { data: cityRows } = await supabase.from('destinations').select('city').eq('status', 'verified')
  const cities = [...new Set((cityRows ?? []).map((r) => r.city).filter(Boolean))].sort() as string[]

  let query = supabase.from('destinations').select('*').eq('status', 'verified')
  const safe = q?.replace(/[,()%*]/g, ' ').trim()
  if (safe) query = query.or(`name.ilike.%${safe}%,city.ilike.%${safe}%`)
  if (kota) query = query.eq('city', kota)
  if (kategori && CATEGORIES.includes(kategori)) query = query.eq('category', kategori)
  if (budget && Number(budget) > 0) query = query.lte('budget_min', Number(budget))
  if (urut === 'termurah') query = query.order('budget_min', { ascending: true, nullsFirst: false })
  else if (urut === 'terbaru') query = query.order('created_at', { ascending: false })
  else query = query.order('name')
  const { data } = await query

  return (
    <>
      <PageHeader title="Destinasi Sumatera Utara" description="Info budget, jam buka, dan cuaca dalam satu tempat." />
      <form className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Input name="q" defaultValue={q} placeholder="Cari nama atau kota…" className="lg:col-span-2" />
        <select name="kota" defaultValue={kota ?? ''} className={field}>
          <option value="">Semua kota</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="kategori" defaultValue={kategori ?? ''} className={field}>
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <select name="budget" defaultValue={budget ?? ''} className={field}>
          <option value="">Semua budget</option>
          <option value="50000">Mulai ≤ Rp50 rb</option>
          <option value="100000">Mulai ≤ Rp100 rb</option>
          <option value="250000">Mulai ≤ Rp250 rb</option>
          <option value="500000">Mulai ≤ Rp500 rb</option>
        </select>
        <select name="urut" defaultValue={urut ?? ''} className={field}>
          <option value="">Urut: Nama</option>
          <option value="termurah">Urut: Termurah</option>
          <option value="terbaru">Urut: Terbaru</option>
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <Button type="submit">Terapkan</Button>
          <Button asChild variant="ghost"><Link href="/destinasi">Reset</Link></Button>
        </div>
      </form>
      <div className="mb-8 overflow-hidden rounded-2xl border"><DestMapLoader items={data ?? []} /></div>
      {data?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((d) => <DestCard key={d.id} d={d} />)}</div>
      ) : (
        <EmptyState icon={Compass} title="Destinasi tidak ditemukan" description="Coba ubah atau reset filter." />
      )}
    </>
  )
}