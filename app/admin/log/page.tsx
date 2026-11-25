import { ScrollText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'

export const metadata = { title: 'Log Aktivitas' }

const label: Record<string, string> = {
  dest_verified: 'Menyetujui destinasi', dest_revision: 'Meminta revisi destinasi', dest_rejected: 'Menolak destinasi',
  dest_create: 'Menambah destinasi', dest_edit: 'Mengedit destinasi', dest_delete: 'Menghapus destinasi', dest_import: 'Impor CSV destinasi',
  report_dismiss: 'Mengabaikan laporan', report_warn: 'Memberi peringatan', report_remove_plan: 'Menghapus rencana (laporan)',
  report_disable_account: 'Menonaktifkan akun (laporan)', plan_delete: 'Menghapus rencana',
  user_disable: 'Menonaktifkan akun', user_enable: 'Mengaktifkan akun',
}

export default async function Log() {
  const supabase = await createClient()
  const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100)
  const ids = [...new Set((data ?? []).map((l) => l.admin_id).filter(Boolean))]
  const { data: admins } = ids.length
    ? await supabase.from('profiles').select('id,full_name').in('id', ids)
    : { data: [] as { id: string; full_name: string }[] }

  return (
    <>
      <PageHeader title="Log Aktivitas Admin" description="100 tindakan terakhir." />
      {data?.length ? (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Waktu</TableHead><TableHead>Admin</TableHead><TableHead>Tindakan</TableHead><TableHead>Target</TableHead><TableHead>Catatan</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">{new Date(l.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                  <TableCell>{admins?.find((a) => a.id === l.admin_id)?.full_name ?? '-'}</TableCell>
                  <TableCell>{label[l.action] ?? l.action}</TableCell>
                  <TableCell className="text-muted-foreground">{l.target_type} #{l.target_id}</TableCell>
                  <TableCell className="max-w-xs truncate" title={l.note ?? ''}>{l.note ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : <EmptyState icon={ScrollText} title="Belum ada aktivitas" />}
    </>
  )
}