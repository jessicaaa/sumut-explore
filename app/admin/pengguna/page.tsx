import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import UserActiveButton from '@/components/UserActiveButton'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'

export const metadata = { title: 'Pengguna' }

const roleLabel: Record<string, string> = { user: 'Traveler', owner: 'Owner', admin: 'Admin' }

export default async function Pengguna({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data } = await supabase.rpc('admin_users', { p_search: q?.trim() || null })

  return (
    <>
      <PageHeader title="Pengguna" description="Cari akun, lalu nonaktifkan bila perlu. Menampilkan 100 terbaru." />
      <form className="mb-6 flex max-w-sm gap-2">
        <Input name="q" defaultValue={q} placeholder="Cari nama atau email…" />
        <Button type="submit">Cari</Button>
      </form>
      {data?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead>Peran</TableHead><TableHead>Rencana</TableHead><TableHead>Daftar</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{roleLabel[u.role] ?? u.role}</TableCell>
                  <TableCell>{u.plan_count}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</TableCell>
                  <TableCell><Badge variant={u.is_active ? 'default' : 'destructive'}>{u.is_active ? 'Aktif' : 'Nonaktif'}</Badge></TableCell>
                  <TableCell className="text-right">{u.role !== 'admin' && <UserActiveButton id={u.id} active={u.is_active} />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : <EmptyState icon={Users} title="Pengguna tidak ditemukan" />}
    </>
  )
}