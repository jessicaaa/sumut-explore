'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import NoteDialog from './NoteDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function UserActiveButton({ id, active }: { id: string; active: boolean }) {
  const supabase = createClient()
  const router = useRouter()

  async function go(note: string) {
    const { error } = await supabase.rpc('admin_set_active', { p_user: id, p_active: !active, p_note: note })
    if (error) { toast.error(errText(error.message)); return false }
    toast.success(active ? 'Akun dinonaktifkan.' : 'Akun diaktifkan kembali.')
    router.refresh()
  }

  return (
    <NoteDialog
      trigger={<Button size="sm" variant={active ? 'outline' : 'default'}>{active ? 'Nonaktifkan' : 'Aktifkan'}</Button>}
      title={active ? 'Nonaktifkan akun ini?' : 'Aktifkan kembali akun ini?'}
      description={active ? 'Semua rencananya disembunyikan dan akun tidak bisa bertindak.' : 'Semua rencananya ditampilkan kembali.'}
      confirmLabel={active ? 'Nonaktifkan' : 'Aktifkan'} destructive={active} noteLabel="Alasan" onConfirm={go} />
  )
}