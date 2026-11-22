import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export default async function Admin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') redirect('/')

  const { data: pending } = await supabase.from('destinations').select('*').eq('status', 'pending')
  const { data: plans } = await supabase.from('plans').select('id,title,start_date').order('created_at', { ascending: false }).limit(20)

  async function setStatus(fd: FormData) {
    'use server'
    const s = await createClient()
    await s.from('destinations').update({ status: fd.get('status') as string }).eq('id', Number(fd.get('id')))
    revalidatePath('/admin')
  }
  async function delPlan(fd: FormData) {
    'use server'
    const s = await createClient()
    await s.from('plans').delete().eq('id', Number(fd.get('id')))
    revalidatePath('/admin')
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 text-lg font-bold">Destinasi menunggu verifikasi</h2>
        {pending?.map((d) => (
          <div key={d.id} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <p className="font-medium">{d.name} <span className="text-sm text-slate-500">· {d.city}</span></p>
            <p className="text-sm">{d.description}</p>
            {d.proof_url && <a href={d.proof_url} target="_blank" className="text-sm text-teal-700 underline">Lihat bukti</a>}
            <form action={setStatus} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={d.id} />
              <button name="status" value="verified" className="rounded bg-teal-600 px-3 py-1 text-sm text-white">Verifikasi</button>
              <button name="status" value="rejected" className="rounded border px-3 py-1 text-sm">Tolak</button>
            </form>
          </div>
        ))}
        {!pending?.length && <p className="text-sm text-slate-500">Tidak ada.</p>}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Moderasi plan</h2>
        {plans?.map((p) => (
          <form key={p.id} action={delPlan} className="mb-2 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
            <span className="text-sm">{p.title} · {p.start_date}</span>
            <input type="hidden" name="id" value={p.id} />
            <button className="rounded border px-3 py-1 text-sm text-red-600">Hapus</button>
          </form>
        ))}
      </section>
    </div>
  )
}