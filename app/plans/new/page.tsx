'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPlan() {
  const supabase = createClient()
  const router = useRouter()
  const [dests, setDests] = useState<{ id: number; name: string }[]>([])
  const [f, setF] = useState({ title: '', destination_id: '', start_date: '', end_date: '', max_buddies: 3, description: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('destinations').select('id,name').eq('status', 'verified').then(({ data }) => setDests(data ?? []))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    const { error } = await supabase.from('plans').insert({
      ...f, destination_id: Number(f.destination_id), creator_id: user.id,
    })
    if (error) return setMsg(error.message)
    router.push('/plans')
  }

  const input = 'w-full rounded-lg border px-3 py-2'
  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-3 rounded-2xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Buat Rencana Perjalanan</h1>
      <input className={input} placeholder="Judul plan" required onChange={(e) => setF({ ...f, title: e.target.value })} />
      <select className={input} required onChange={(e) => setF({ ...f, destination_id: e.target.value })}>
        <option value="">Pilih destinasi</option>
        {dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <div className="flex gap-3">
        <input className={input} type="date" required onChange={(e) => setF({ ...f, start_date: e.target.value })} />
        <input className={input} type="date" required onChange={(e) => setF({ ...f, end_date: e.target.value })} />
      </div>
      <input className={input} type="number" min={1} max={10} defaultValue={3} onChange={(e) => setF({ ...f, max_buddies: Number(e.target.value) })} />
      <textarea className={input} placeholder="Deskripsi singkat" onChange={(e) => setF({ ...f, description: e.target.value })} />
      {msg && <p className="text-sm text-orange-600">{msg}</p>}
      <button className="w-full rounded-lg bg-teal-600 py-2 font-semibold text-white">Simpan</button>
    </form>
  )
}