'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import NoteDialog from './NoteDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function ReportActions({ id, canRemovePlan, canDisable }: {
  id: number; canRemovePlan: boolean; canDisable: boolean
}) {
  const supabase = createClient()
  const router = useRouter()

  async function act(action: string, note: string) {
    const { error } = await supabase.rpc('handle_report', { p_report: id, p_action: action, p_note: note })
    if (error) { toast.error(errText(error.message)); return false }
    toast.success('Tindakan tercatat.')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <NoteDialog trigger={<Button size="sm" variant="outline">Abaikan</Button>} title="Abaikan laporan?"
        description="Laporan ditutup tanpa tindakan." confirmLabel="Abaikan" noteLabel="Alasan diabaikan"
        onConfirm={(n) => act('dismiss', n)} />
      <NoteDialog trigger={<Button size="sm" variant="outline">Beri Peringatan</Button>} title="Beri peringatan ke pembuat rencana"
        description="Pembuat rencana menerima notifikasi berisi catatanmu." confirmLabel="Kirim peringatan"
        noteLabel="Isi peringatan" onConfirm={(n) => act('warn', n)} />
      {canRemovePlan && (
        <NoteDialog trigger={<Button size="sm" variant="destructive">Hapus Rencana</Button>} title="Hapus rencana ini?"
          description="Rencana dan semua permintaan gabungnya dihapus. Pembuat dan peminta diberi tahu." confirmLabel="Hapus rencana"
          destructive noteLabel="Alasan penghapusan" onConfirm={(n) => act('remove_plan', n)} />
      )}
      {canDisable && (
        <NoteDialog trigger={<Button size="sm" variant="destructive">Nonaktifkan Akun</Button>} title="Nonaktifkan akun pembuat rencana?"
          description="Akun tidak bisa bertindak dan semua rencananya disembunyikan."
          confirmLabel="Nonaktifkan akun" destructive noteLabel="Alasan penonaktifan"
          onConfirm={(n) => act('disable_account', n)} />
      )}
    </div>
  )
}