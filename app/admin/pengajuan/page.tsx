import Link from 'next/link'
import { ClipboardCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { STATUS_UI } from '@/lib/dest'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Pengajuan Destinasi' }

const filters: [string, string][] = [
  ['pending', 'Menunggu'], ['revision', 'Revisi'], ['verified', 'Terverifikasi'], ['rejected', 'Ditolak'], ['semua', 'Semua'],
]

export default async function Pengajuan({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = 'pending', q } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('destinations')
    .select('id,name,city,status,owner_id,submitted_at,updated_at')
    .not('owner_id', 'is', null).neq('status', 'draft').limit(100)
  if (status !== 'semua') query = query.eq('status', status)
  const safe = q?.replace(/[%,()*]/g, ' ').trim()
  if (safe) query = query.ilike('name', `%${safe}%`)
  query = status === 'pending'
    ? query.order('submitted_at', { ascending: true, nullsFirst: false })
    : query.order('updated_at', { ascending: false })
  const { data } = await query

  const ownerIds = [...new Set((data ?? []).map((d) => d.owner_id))]
  const { data: owners } = ownerIds.length
    ? await supabase.from('profiles').select('id,full_name').in('id', ownerIds)
    : { data: [] as { id: string; full_name: string }[] }
  const ownerName = (id: string) => owners?.find((o) => o.id === id)?.full_name ?? '-'

  return (
    <>
      <PageHeader title="Pengajuan Destinasi" description="Yang menunggu paling lama tampil paling atas." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map(([v, label]) => (
          <Link key={v} href={`?status=${v}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={cn('rounded-full border px-3 py-1 text-sm', status === v ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent')}>
            {label}
          </Link>
        ))}
      </div>
      <form className="mb-6 flex max-w-sm gap-2">
        <input type="hidden" name="status" value={status} />
        <Input name="q" defaultValue={q} placeholder="Cari nama destinasi…" />
        <Button type="submit">Cari</Button>
      </form>

      {data?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Destinasi</TableHead><TableHead>Pemilik</TableHead><TableHead>Dikirim</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => {
                const s = STATUS_UI[d.status]
                return (
                  <TableRow key={d.id}>
                    <TableCell><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.city}</p></TableCell>
                    <TableCell>{ownerName(d.owner_id)}</TableCell>
                    <TableCell>{d.submitted_at ? new Date(d.submitted_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</TableCell>
                    <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                    <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/pengajuan/${d.id}`}>Tinjau</Link></Button></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={ClipboardCheck} title="Tidak ada pengajuan" description="Belum ada pengajuan dengan filter ini." />
      )}
    </>
  )
}