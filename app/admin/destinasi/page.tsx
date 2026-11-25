import Link from 'next/link'
import { MapPinned, Plus, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'

export const metadata = { title: 'Kelola Destinasi' }

export default async function AdminDest({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  let query = supabase.from('destinations').select('id,name,city,category,status,owner_id,photos')
    .in('status', ['verified', 'draft']).order('name').limit(200)
  const safe = q?.replace(/[%,()*]/g, ' ').trim()
  if (safe) query = query.or(`name.ilike.%${safe}%,city.ilike.%${safe}%`)
  const { data } = await query

  const actions = (
    <div className="flex gap-2">
      <Button asChild variant="outline"><Link href="/admin/destinasi/impor"><Upload className="mr-1 h-4 w-4" />Impor CSV</Link></Button>
      <Button asChild><Link href="/admin/destinasi/baru"><Plus className="mr-1 h-4 w-4" />Tambah</Link></Button>
    </div>
  )

  return (
    <>
      <PageHeader title="Kelola Destinasi" description="Destinasi umum yang kamu tambah sendiri, dan destinasi owner yang sudah tayang." action={actions} />
      <form className="mb-6 flex max-w-sm gap-2">
        <Input name="q" defaultValue={q} placeholder="Cari nama atau kota…" />
        <Button type="submit">Cari</Button>
      </form>
      {data?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Destinasi</TableHead><TableHead>Kategori</TableHead><TableHead>Sumber</TableHead><TableHead>Foto</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.city}</p></TableCell>
                  <TableCell className="capitalize">{d.category}</TableCell>
                  <TableCell>{d.owner_id ? 'Owner' : 'Admin'}</TableCell>
                  <TableCell>{d.photos?.length ?? 0}</TableCell>
                  <TableCell><Badge variant={d.status === 'verified' ? 'default' : 'outline'}>{d.status === 'verified' ? 'Tayang' : 'Draf'}</Badge></TableCell>
                  <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/destinasi/${d.id}`}>Edit</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : <EmptyState icon={MapPinned} title="Belum ada destinasi" action={actions} />}
    </>
  )
}