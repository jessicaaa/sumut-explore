'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import NoteDialog from './NoteDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function ReviewActions({ id }: { id: number }) {
  const supabase = createClient()
  const router = useRouter()

  async function decide(decision: string, note: string) {
    const { error } = await supabase.rpc('review_destination', { p_id: id, p_decision: decision, p_note: note || null })
    if (error) { toast.error(errText(error.message)); return false }
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dest_decision', destId: id }),
    }).then((r) => r.json()).catch(() => null)
    toast.success(res?.sent
      ? 'Keputusan tersimpan. Owner diberi notifikasi dan email.'
      : 'Keputusan tersimpan. Notifikasi dalam aplikasi terkirim, tetapi email tidak terkirim.')
    router.push('/admin/pengajuan')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <NoteDialog trigger={<Button>Setujui</Button>} title="Setujui destinasi ini?"
        description="Destinasi langsung tayang di halaman publik." confirmLabel="Setujui"
        noteRequired={false} noteLabel="Catatan internal (opsional)" onConfirm={(n) => decide('verified', n)} />
      <NoteDialog trigger={<Button variant="outline">Minta Revisi</Button>} title="Minta revisi"
        description="Owner akan menerima catatanmu dan bisa memperbaiki lalu mengirim ulang."
        confirmLabel="Kirim permintaan revisi" noteLabel="Apa yang perlu diperbaiki" onConfirm={(n) => decide('revision', n)} />
      <NoteDialog trigger={<Button variant="destructive">Tolak</Button>} title="Tolak pengajuan"
        description="Owner akan menerima alasan penolakan." confirmLabel="Tolak pengajuan" destructive
        noteLabel="Alasan penolakan" onConfirm={(n) => decide('rejected', n)} />
    </div>
  )
}