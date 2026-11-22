import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RequestActions from '@/components/RequestActions'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: incoming } = await supabase
    .from('join_requests')
    .select('id,status,message,requester_id,plans!inner(title,creator_id)')
    .eq('plans.creator_id', user.id)
    .order('created_at', { ascending: false })

  const { data: mine } = await supabase
    .from('join_requests')
    .select('id,status,plans(title,creator_id)')
    .eq('requester_id', user.id)

  // Kontak hanya terbaca bila RLS mengizinkan (approved)
  const ids = [...new Set([
    ...(incoming ?? []).filter((r) => r.status === 'approved').map((r) => r.requester_id),
    ...(mine ?? []).filter((r: any) => r.status === 'approved').map((r: any) => r.plans.creator_id),
  ])]
  const { data: contacts } = ids.length
    ? await supabase.from('profiles').select('id,full_name,whatsapp,instagram').in('id', ids)
    : { data: [] as any[] }
  const contactOf = (id: string) => contacts?.find((c) => c.id === id)

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h2 className="mb-3 text-lg font-bold">Permintaan masuk ke plan-mu</h2>
        <div className="space-y-3">
          {incoming?.map((r: any) => {
            const c = contactOf(r.requester_id)
            return (
              <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-medium">{r.plans.title}</p>
                <p className="text-sm text-slate-500">Status: {r.status}</p>
                {r.status === 'pending' && <div className="mt-2"><RequestActions id={r.id} /></div>}
                {c && <p className="mt-2 text-sm">{c.full_name} · WA {c.whatsapp} · IG @{c.instagram}</p>}
              </div>
            )
          })}
          {!incoming?.length && <p className="text-sm text-slate-500">Belum ada.</p>}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Permintaan gabung-mu</h2>
        <div className="space-y-3">
          {mine?.map((r: any) => {
            const c = contactOf(r.plans.creator_id)
            return (
              <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-medium">{r.plans.title}</p>
                <p className="text-sm text-slate-500">Status: {r.status}</p>
                {c && <p className="mt-2 text-sm">{c.full_name} · WA {c.whatsapp} · IG @{c.instagram}</p>}
              </div>
            )
          })}
          {!mine?.length && <p className="text-sm text-slate-500">Belum ada.</p>}
        </div>
      </section>
    </div>
  )
}