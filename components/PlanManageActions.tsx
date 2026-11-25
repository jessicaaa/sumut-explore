'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { todayStr } from '@/lib/config'

export default function PlanManageActions({ plan }: {
  plan: { id: number; title: string | null; status: string; start_date: string | null }
}) {
  const supabase = createClient()
  const router = useRouter()

  async function setStatus(status: 'open' | 'closed') {
    if (status === 'open' && (!plan.start_date || plan.start_date < todayStr()))
      return toast.error('Tanggal berangkat sudah lewat atau belum diisi. Edit rencana dulu.')
    const { error } = await supabase.from('plans').update({ status }).eq('id', plan.id)
    if (error) return toast.error('Gagal mengubah status.')
    toast.success(status === 'open' ? 'Rencana dibuka.' : 'Pendaftaran ditutup.')
    router.refresh()
  }

  async function remove() {
    const { error } = await supabase.from('plans').delete().eq('id', plan.id)
    if (error) return toast.error('Gagal menghapus rencana.')
    toast.success('Rencana dihapus.')
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline"><Link href={`/rencana/${plan.id}/edit`}>Edit</Link></Button>
      {plan.status === 'draft' && <Button size="sm" onClick={() => setStatus('open')}>Terbitkan</Button>}
      {plan.status === 'open' && <Button size="sm" variant="outline" onClick={() => setStatus('closed')}>Tutup pendaftaran</Button>}
      {plan.status === 'closed' && <Button size="sm" variant="outline" onClick={() => setStatus('open')}>Buka lagi</Button>}
      <ConfirmDialog
        trigger={<Button size="sm" variant="ghost" className="text-destructive">Hapus</Button>}
        title="Hapus rencana ini?"
        description="Semua permintaan gabung ikut terhapus dan para peminta akan diberi tahu. Tidak bisa dibatalkan."
        confirmLabel="Hapus"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}