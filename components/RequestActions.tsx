'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RequestActions({ id }: { id: number }) {
  const supabase = createClient()
  const router = useRouter()

  async function decide(status: 'approved' | 'rejected') {
    await supabase.from('join_requests').update({ status }).eq('id', id)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => decide('approved')} className="rounded bg-teal-600 px-3 py-1 text-sm text-white">Setujui</button>
      <button onClick={() => decide('rejected')} className="rounded border px-3 py-1 text-sm">Tolak</button>
    </div>
  )
}