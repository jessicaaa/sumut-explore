import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import JoinButton from '@/components/JoinButton'

export default async function Plans() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('plans')
    .select('*, destinations(name)')
    .gte('start_date', today)
    .order('start_date')

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rencana Perjalanan</h1>
        <Link href="/plans/new" className="rounded-lg bg-teal-600 px-4 py-2 text-white">+ Buat Plan</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((p) => (
          <article key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm text-slate-500">{p.destinations?.name}</p>
            <p className="mt-1 text-sm">📅 {p.start_date} s/d {p.end_date} · maks {p.max_buddies} teman</p>
            <p className="mt-2 text-sm">{p.description}</p>
            <div className="mt-3"><JoinButton planId={p.id} /></div>
          </article>
        ))}
        {!data?.length && <p>Belum ada plan. Jadi yang pertama!</p>}
      </div>
    </>
  )
}