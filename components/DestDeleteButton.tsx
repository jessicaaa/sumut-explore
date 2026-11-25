'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog'
import { createClient } from '@/lib/supabase/client'

export default function DestDeleteButton({ id }: { id: number }) {
  const supabase = createClient()
  const router = useRouter()

  async function remove() {
    const { data, error } = await supabase.from('destinations').delete().eq('id', id).select('id')
    if (error || !data?.length) return toast.error('Gagal menghapus. Hanya draf atau pengajuan ditolak yang bisa dihapus.')
    toast.success('Pengajuan dihapus.')
    router.push('/owner')
    router.refresh()
  }

  return (
    <ConfirmDialog
      trigger={<Button variant="ghost" className="text-destructive">Hapus</Button>}
      title="Hapus pengajuan ini?"
      description="Data dan riwayatnya ikut terhapus. Tidak bisa dibatalkan."
      confirmLabel="Hapus"
      destructive
      onConfirm={remove}
    />
  )
}