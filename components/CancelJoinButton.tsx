'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ConfirmDialog from './ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function CancelJoinButton({ id }: { id: number }) {
  const supabase = createClient()
  const router = useRouter()

  async function cancel() {
    const { error } = await supabase.rpc('cancel_join', { p_request: id })
    if (error) return toast.error(errText(error.message))
    toast.success('Permintaan dibatalkan.')
    router.refresh()
  }

  return (
    <ConfirmDialog
      trigger={<Button size="sm" variant="outline">Batalkan</Button>}
      title="Batalkan permintaan gabung?"
      description="Kamu bisa mengajukan lagi nanti selama rencana masih terbuka."
      confirmLabel="Batalkan permintaan"
      destructive
      onConfirm={cancel}
    />
  )
}