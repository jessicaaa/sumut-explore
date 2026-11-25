import Link from 'next/link'
import { CalendarPlus, Route } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/PlanCard'
import PlanCalendar from '@/components/PlanCalendar'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { todayStr } from '@/lib/config'
import { field } from '@/lib/ui'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Rencana Perjalanan' }

type SP = { tampil?: string; dari?: string; sampai?: string; destinasi?: string; kuota?: string; budget?: string }

export default async function Rencana({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const tampil = sp.tampil === 'kalender' ? 'kalender' : 'daftar'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: dests } = await supabase.from('destinations').select('id,name').eq('status', 'verified').order('name')
  const destId = sp.destinasi ? Number(sp.destinasi) : undefined

  let plans: any[] = []
  if (tampil === 'daftar') {
    let q = supabase.from('plans_view').select('*').in('effective_status', ['open', 'closed']).order('start_date')
    q = q.gte('start_date', sp.dari || todayStr())
    if (sp.sampai) q = q.lte('start_date', sp.sampai)
    if (destId) q = q.eq('destination_id', destId)
    if (sp.budget) q = q.lte('budget_per_person', Number(sp.budget))
    const { data } = await q
    plans = data ?? []
    if (sp.kuota) plans = plans.filter((p) => p.max_buddies - p.approved_count >= Number(sp.kuota))
  }
  const nameOf = (id: number) => dests?.find((d) => d.id === id)?.name

  const tab = (v: string, label: string) => {
    const p = new URLSearchParams()
    Object.entries(sp).forEach(([k, val]) => val && k !== 'tampil' && p.set(k, val))
    p.set('tampil', v)
    return (
      <Link href={`?${p.toString()}`} className={cn('rounded-md px-4 py-1.5 text-sm font-medium',
        tampil === v ? 'bg-background shadow-sm' : 'text-muted-foreground')}>{label}</Link>
    )
  }

  const create = (
    <Button asChild className="bg-cta text-cta-foreground hover:bg-cta/90">
      <Link href="/rencana/buat"><CalendarPlus className="mr-1 h-4 w-4" />Buat Rencana</Link>
    </Button>
  )

  return (
    <>
      <PageHeader title="Rencana Perjalanan" description="Temukan rencana yang cocok, lalu ajukan gabung." action={create} />
      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">{tab('daftar', 'Daftar')}{tab('kalender', 'Kalender')}</div>

      <form className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input type="hidden" name="tampil" value={tampil} />
        <select name="destinasi" defaultValue={sp.destinasi ?? ''} className={field}>
          <option value="">Semua destinasi</option>
          {dests?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {tampil === 'daftar' && (
          <>
            <Input type="date" name="dari" defaultValue={sp.dari} aria-label="Dari tanggal" />
            <Input type="date" name="sampai" defaultValue={sp.sampai} aria-label="Sampai tanggal" />
            <select name="kuota" defaultValue={sp.kuota ?? ''} className={field}>
              <option value="">Semua kuota</option>
              <option value="1">Sisa ≥ 1 tempat</option>
              <option value="2">Sisa ≥ 2 tempat</option>
              <option value="3">Sisa ≥ 3 tempat</option>
            </select>
            <select name="budget" defaultValue={sp.budget ?? ''} className={field}>
              <option value="">Semua budget</option>
              <option value="250000">≤ Rp250 rb / orang</option>
              <option value="500000">≤ Rp500 rb / orang</option>
              <option value="1000000">≤ Rp1 jt / orang</option>
            </select>
          </>
        )}
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">Terapkan</Button>
          <Button asChild variant="ghost"><Link href={`?tampil=${tampil}`}>Reset</Link></Button>
        </div>
      </form>

      {tampil === 'kalender' ? (
        <PlanCalendar destId={destId} />
      ) : plans.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((p) => <PlanCard key={p.id} p={p} destName={nameOf(p.destination_id)} isMine={p.creator_id === user?.id} />)}
        </div>
      ) : (
        <EmptyState icon={Route} title="Belum ada rencana yang cocok" description="Ubah filter, atau buat rencanamu sendiri." action={create} />
      )}
    </>
  )
}