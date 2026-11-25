import Link from 'next/link'
import { Route } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AdminPlanDelete from '@/components/AdminPlanDelete'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { rentang } from '@/lib/format'

export const metadata = { title: 'Rencana' }

export default async function AdminPlans({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  let query = supabase.from('plans_view').select('*').neq('status', 'draft').order('created_at', { ascending: false }).limit(50)
  const safe = q?.replace(/[%,()*]/g, ' ').trim()
  if (safe) query = query.ilike('title', `%${safe}%`)
  const { data } = await query

  const creatorIds = [...new Set((data ?? []).map((p) => p.creator_id))]
  const destIds = [...new Set((data ?? []).map((p) => p.destination_id).filter(Boolean))]
  const [{ data: people }, { data: dests }] = await Promise.all([
    creatorIds.length ? supabase.from('profiles').select('id,full_name').in('id', creatorIds) : Promise.resolve({ data: [] as any[] }),
    destIds.length ? supabase.from('destinations').select('id,name').in('id', destIds) : Promise.resolve({ data: [] as any[] }),
  ])

  return (
    <>
      <PageHeader title="Rencana" description="Lihat dan hapus rencana yang melanggar ketentuan." />
      <form className="mb-6 flex max-w-sm gap-2">
        <Input name="q" defaultValue={q} placeholder="Cari judul rencana…" />
        <Button type="submit">Cari</Button>
      </form>
      {data?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Rencana</TableHead><TableHead>Pembuat</TableHead><TableHead>Tanggal</TableHead><TableHead>Peserta</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/rencana/${p.id}`} className="font-medium hover:text-primary">{p.title}</Link>
                    <p className="text-xs text-muted-foreground">{dests?.find((d) => d.id === p.destination_id)?.name ?? '-'}</p>
                  </TableCell>
                  <TableCell>{people?.find((x) => x.id === p.creator_id)?.full_name ?? '-'}</TableCell>
                  <TableCell>{rentang(p.start_date, p.end_date)}</TableCell>
                  <TableCell>{p.approved_count}/{p.max_buddies}</TableCell>
                  <TableCell>
                    {p.is_hidden ? <Badge variant="destructive">Disembunyikan</Badge>
                      : <Badge variant={p.effective_status === 'open' ? 'default' : 'secondary'}>{p.effective_status === 'open' ? 'Terbuka' : p.effective_status === 'closed' ? 'Ditutup' : 'Selesai'}</Badge>}
                  </TableCell>
                  <TableCell className="text-right"><AdminPlanDelete id={p.id} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : <EmptyState icon={Route} title="Tidak ada rencana" />}
    </>
  )
}