'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function JoinButton({ planId }: { planId: number }) {
  const supabase = createClient()
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [err, setErr] = useState('')

  async function join() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return (window.location.href = '/login')
    const { error } = await supabase.from('join_requests').insert({ plan_id: planId, requester_id: user.id })
    if (error) {
      setErr(error.code === '23505' ? 'Kamu sudah mengajukan.' : 'Tidak bisa join (plan sendiri / lewat batas H-3).')
      return setState('error')
    }
    setState('sent')
  }

  if (state === 'sent') return <span className="text-sm text-teal-700">Permintaan terkirim ✓</span>
  return (
    <div>
      <button onClick={join} className="rounded-lg bg-orange-500 px-3 py-1 text-sm text-white">Ajukan Gabung</button>
      {state === 'error' && <p className="mt-1 text-xs text-orange-600">{err}</p>}
    </div>
  )
}