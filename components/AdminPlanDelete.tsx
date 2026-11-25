'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import NoteDialog from './NoteDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function AdminPlanDelete({ id }: { id: number }) {
  const supabase = createClient()
  const router = useRouter()

  async function remove(note: string) {
    const { error } = await supabase.rpc('admin_delete_plan', { p_plan: id, p_note: note })
    if (error) { toast.error(errText(error.message)); return false }
    toast.success('Rencana dihapus.')
    router.refresh()
  }

  return (
    <NoteDialog trigger={<Button size="sm" variant="ghost" className="text-destructive">Hapus</Button>}
      title="Hapus rencana ini?" description="Pembuat dan peminta gabung akan diberi tahu."
      confirmLabel="Hapus rencana" destructive noteLabel="Alasan penghapusan" onConfirm={remove} />
  )
}