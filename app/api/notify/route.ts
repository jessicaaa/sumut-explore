import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { requireRole } from '@/lib/auth'
import { sendMail } from '@/lib/email'

const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})
const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const done = (sent: boolean) => NextResponse.json({ ok: true, sent })

async function emailOf(id: string) {
  const { data } = await admin.auth.admin.getUserById(id)
  return data.user?.email ?? null
}
async function nameOf(id: string) {
  const { data } = await admin.from('profiles').select('full_name').eq('id', id).maybeSingle()
  return data?.full_name ?? 'Seseorang'
}

export async function POST(req: Request) {
  const ctx = await requireRole(['user', 'owner', 'admin'])
  if (!ctx) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  const type = String(body.type)

  try {
    // ===== Join & keputusan join =====
    if (type === 'join' || type === 'decision') {
      const id = Number(body.requestId)
      if (!Number.isInteger(id)) return NextResponse.json({ error: 'bad request' }, { status: 400 })
      const { data: jr } = await ctx.supabase
        .from('join_requests')
        .select('id,status,message,requester_id,plans(id,title,creator_id)')
        .eq('id', id).maybeSingle()
      if (!jr) return NextResponse.json({ error: 'not found' }, { status: 404 })
      const plan = jr.plans as any
      const flag = type === 'join' ? 'notified_join' : 'notified_decision'

      if (type === 'join' && !(jr.requester_id === ctx.user.id && jr.status === 'pending')) return done(false)
      if (type === 'decision' && !(plan.creator_id === ctx.user.id && ['approved', 'rejected'].includes(jr.status))) return done(false)

      const { data: claimed } = await admin.from('join_requests').update({ [flag]: true }).eq('id', id).eq(flag, false).select('id')
      if (!claimed?.length) return done(false)

      const toId = type === 'join' ? plan.creator_id : jr.requester_id
      const to = await emailOf(toId)
      let ok = false
      if (to) {
        if (type === 'join') {
          ok = await sendMail({
            to,
            subject: `Permintaan gabung baru: ${plan.title}`,
            heading: 'Ada permintaan gabung baru',
            lines: [
              `${await nameOf(jr.requester_id)} ingin bergabung ke rencanamu "${plan.title}".`,
              ...(jr.message ? [`Pesannya: "${jr.message}"`] : []),
              'Buka dashboard untuk melihat profilnya, lalu setujui atau tolak.',
            ],
            button: { label: 'Buka dashboard', url: `${site()}/dashboard?tab=masuk` },
            reason: 'Kamu menerima email ini karena kamu membuat rencana di SumUt Explore.',
          })
        } else {
          const approved = jr.status === 'approved'
          ok = await sendMail({
            to,
            subject: `Permintaan gabung ${approved ? 'disetujui' : 'ditolak'}: ${plan.title}`,
            heading: approved ? 'Permintaanmu disetujui' : 'Permintaanmu belum bisa diterima',
            lines: approved
              ? [`Permintaanmu untuk bergabung ke "${plan.title}" disetujui.`, 'Kontak pembuat rencana kini terlihat di dashboard. Demi keamanan, nomor tidak kami kirim lewat email.']
              : [`Permintaanmu untuk bergabung ke "${plan.title}" belum bisa diterima.`, 'Jangan menyerah, masih banyak rencana lain yang cocok.'],
            button: { label: approved ? 'Lihat kontak di dashboard' : 'Cari rencana lain', url: approved ? `${site()}/dashboard?tab=saya` : `${site()}/rencana` },
            reason: 'Kamu menerima email ini karena kamu mengajukan gabung di SumUt Explore.',
          })
        }
      }
      if (!ok) await admin.from('join_requests').update({ [flag]: false }).eq('id', id)
      return done(ok)
    }

    // ===== Keputusan admin untuk destinasi owner =====
    if (type === 'dest_decision') {
      if (ctx.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
      const id = Number(body.destId)
      if (!Number.isInteger(id)) return NextResponse.json({ error: 'bad request' }, { status: 400 })
      const { data: d } = await admin.from('destinations').select('id,name,slug,status,admin_note,owner_id,owner_notified_status').eq('id', id).maybeSingle()
      if (!d?.owner_id || !['verified', 'revision', 'rejected'].includes(d.status)) return done(false)

      const { data: claimed } = await admin.from('destinations').update({ owner_notified_status: d.status })
        .eq('id', id).or(`owner_notified_status.is.null,owner_notified_status.neq.${d.status}`).select('id')
      if (!claimed?.length) return done(false)

      const to = await emailOf(d.owner_id)
      let ok = false
      if (to) {
        const statusUrl = `${site()}/owner/destinasi/${d.id}`
        const map: Record<'verified' | 'revision' | 'rejected', {
          subject: string
          heading: string
          lines: string[]
          button: { label: string; url: string }
        }> = {
          verified: {
            subject: `Destinasi disetujui: ${d.name}`, heading: 'Destinasimu sudah tayang',
            lines: [`"${d.name}" sudah terverifikasi dan tampil di halaman publik SumUt Explore.`],
            button: { label: 'Lihat halaman destinasi', url: `${site()}/destinasi/${d.slug}` },
          },
          revision: {
            subject: `Destinasi perlu revisi: ${d.name}`, heading: 'Pengajuanmu perlu diperbaiki',
            lines: [`Admin meminta revisi untuk "${d.name}".`, `Catatan admin: ${d.admin_note ?? '-'}`, 'Perbaiki datanya lalu kirim ulang untuk diverifikasi.'],
            button: { label: 'Perbaiki dan kirim ulang', url: statusUrl },
          },
          rejected: {
            subject: `Pengajuan destinasi ditolak: ${d.name}`, heading: 'Pengajuanmu belum dapat diterima',
            lines: [`Pengajuan "${d.name}" ditolak.`, `Alasan: ${d.admin_note ?? '-'}`],
            button: { label: 'Lihat detail', url: statusUrl },
          },
        }
        const m = map[d.status as keyof typeof map]
        ok = await sendMail({ to, ...m, reason: 'Kamu menerima email ini karena kamu mengajukan destinasi di SumUt Explore.' })
      }
      if (!ok) await admin.from('destinations').update({ owner_notified_status: d.owner_notified_status }).eq('id', id)
      return done(ok)
    }

    return NextResponse.json({ error: 'unknown type' }, { status: 400 })
  } catch (e) {
    console.error('[notify]', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}