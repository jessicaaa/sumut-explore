'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function RequestActions({ id, name }: { id: number; name?: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function decide(status: 'approved' | 'rejected') {
    const { error } = await supabase.rpc('decide_join', { p_request: id, p_status: status })
    if (error) return toast.error(errText(error.message))
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'decision', requestId: id }),
    })
    toast.success(status === 'approved' ? 'Permintaan disetujui.' : 'Permintaan ditolak.')
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <ConfirmDialog
        trigger={<Button size="sm">Setujui</Button>}
        title="Setujui permintaan ini?"
        description={`Kontakmu dan kontak ${name ?? 'peminta'} akan saling terlihat di dashboard.`}
        confirmLabel="Setujui"
        onConfirm={() => decide('approved')}
      />
      <ConfirmDialog
        trigger={<Button size="sm" variant="outline">Tolak</Button>}
        title="Tolak permintaan ini?"
        description="Peminta akan diberi tahu dan keputusan tidak bisa diubah."
        confirmLabel="Tolak"
        destructive
        onConfirm={() => decide('rejected')}
      />
    </div>
  )
}