import { createClient } from '@/lib/supabase/server'
import Weather from '@/components/Weather'

const rp = (n: number | null) => (n == null ? '-' : 'Rp' + n.toLocaleString('id-ID'))

export default async function Destinations() {
  const supabase = await createClient()
  const { data } = await supabase.from('destinations').select('*').eq('status', 'verified').order('name')

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Destinasi Sumatera Utara</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((d) => (
          <article key={d.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{d.name}</h2>
            <p className="text-sm text-slate-500">{d.city}</p>
            <p className="mt-2 text-sm">{d.description}</p>
            <dl className="mt-3 space-y-1 text-sm">
              <div>💰 {rp(d.budget_min)} - {rp(d.budget_max)}</div>
              <div>🕒 {d.open_hours ?? '-'}</div>
              {d.lat && d.lng && <div><Weather lat={d.lat} lng={d.lng} /></div>}
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}