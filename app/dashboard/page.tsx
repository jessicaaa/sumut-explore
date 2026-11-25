import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AtSign, Bell, CalendarDays, Inbox, Phone, Route, Send, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ContactLink from '@/components/ContactLink'
import RequestActions from '@/components/RequestActions'
import CancelJoinButton from '@/components/CancelJoinButton'
import PlanManageActions from '@/components/PlanManageActions'
import ShareButton from '@/components/ShareButton'
import MarkReadButton from '@/components/MarkReadButton'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { rentang } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

type V = 'default' | 'secondary' | 'destructive' | 'outline'
const reqStatus: Record<string, [string, V]> = {
  pending: ['Menunggu', 'secondary'],
  approved: ['Disetujui', 'default'],
  rejected: ['Ditolak', 'destructive'],
  cancelled: ['Dibatalkan', 'outline'],
}
const planStatus = (p: any): [string, V] =>
  p.effective_status === 'completed' ? ['Selesai', 'secondary']
  : p.effective_status === 'draft' ? ['Draf', 'outline']
  : p.effective_status === 'closed' ? ['Ditutup', 'secondary']
  : p.approved_count >= p.max_buddies ? ['Penuh', 'secondary']
  : ['Terbuka', 'default']

function ContactCard({ c, reqId }: { c: any; reqId: number }) {
  const wa = String(c.whatsapp ?? '').replace(/\D/g, '').replace(/^0/, '62')
  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <p className="mb-1 font-medium">Kontak terbuka · {c.full_name}</p>
      <div className="flex flex-wrap gap-4">
        {wa && (
          <ContactLink reqId={reqId} href={`https://wa.me/${wa}`} className="inline-flex items-center gap-1 text-primary underline">
            <Phone className="h-3.5 w-3.5" />{c.whatsapp}
          </ContactLink>
        )}
        {c.instagram && (
          <ContactLink reqId={reqId} href={`https://instagram.com/${encodeURIComponent(c.instagram)}`}
            className="inline-flex items-center gap-1 text-primary underline">
            <AtSign className="h-3.5 w-3.5" />@{c.instagram}
          </ContactLink>
        )}
        {!wa && !c.instagram && <span className="text-muted-foreground">Pengguna ini belum mengisi kontak.</span>}
      </div>
    </div>
  )
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: myPlans }, { data: incoming }, { data: mine }, { data: notifs }] = await Promise.all([
    supabase.from('plans_view').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
    supabase.from('join_requests')
      .select('id,status,message,requester_id,plan_id,plans!inner(title,creator_id,start_date,end_date)')
      .eq('plans.creator_id', user.id).order('created_at', { ascending: false }),
    supabase.from('join_requests')
      .select('id,status,plan_id,plans(title,creator_id,start_date,end_date)')
      .eq('requester_id', user.id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30),
  ])

  const requesterIds = [...new Set((incoming ?? []).map((r: any) => r.requester_id))]
  const { data: people } = requesterIds.length
    ? await supabase.rpc('requester_names', { p_ids: requesterIds })
    : { data: [] as any[] }
  const personOf = (id: string) => people?.find((p: any) => p.id === id)

  const contactIds = [...new Set([
    ...(incoming ?? []).filter((r: any) => r.status === 'approved').map((r: any) => r.requester_id),
    ...(mine ?? []).filter((r: any) => r.status === 'approved').map((r: any) => r.plans.creator_id),
  ])]
  const { data: contacts } = contactIds.length
    ? await supabase.from('profiles').select('id,full_name,whatsapp,instagram').in('id', contactIds)
    : { data: [] as any[] }
  const contactOf = (id: string) => contacts?.find((c) => c.id === id)

  const pendingByPlan = new Map<number, number>()
  ;(incoming ?? []).forEach((r: any) => r.status === 'pending' && pendingByPlan.set(r.plan_id, (pendingByPlan.get(r.plan_id) ?? 0) + 1))
  const pendingCount = [...pendingByPlan.values()].reduce((a, b) => a + b, 0)
  const unread = (notifs ?? []).filter((n) => !n.is_read).length
  const defaultTab = tab && ['rencana', 'masuk', 'saya', 'notifikasi'].includes(tab) ? tab : pendingCount > 0 ? 'masuk' : 'rencana'
  const createBtn = <Button asChild><Link href="/rencana/buat">Buat rencana</Link></Button>

  return (
    <>
      <PageHeader title="Dashboard" description="Kelola rencanamu dan permintaan gabung." action={createBtn} />
      <Tabs defaultValue={defaultTab}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="rencana">Rencana Saya</TabsTrigger>
          <TabsTrigger value="masuk">Permintaan Masuk{pendingCount > 0 && <Badge className="ml-2">{pendingCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="saya">Permintaan Saya</TabsTrigger>
          <TabsTrigger value="notifikasi">Notifikasi{unread > 0 && <Badge className="ml-2">{unread}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="rencana" className="mt-4 space-y-3">
          {myPlans?.length ? myPlans.map((p: any) => {
            const [label, variant] = planStatus(p)
            const pending = pendingByPlan.get(p.id) ?? 0
            return (
              <Card key={p.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/rencana/${p.id}`} className="font-medium hover:text-primary">{p.title ?? 'Draf tanpa judul'}</Link>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />
                          {p.start_date && p.end_date ? rentang(p.start_date, p.end_date) : 'Tanggal belum diisi'}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.approved_count}/{p.max_buddies}</span>
                        {pending > 0 && <span className="font-medium text-cta">{pending} permintaan baru</span>}
                      </p>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {p.effective_status !== 'completed'
                      ? <PlanManageActions plan={{ id: p.id, title: p.title, status: p.status, start_date: p.start_date }} />
                      : <span />}
                    {p.effective_status === 'open' && <ShareButton id={p.id} title={p.title} />}
                  </div>
                </CardContent>
              </Card>
            )
          }) : <EmptyState icon={Route} title="Belum ada rencana" description="Buat rencana pertamamu dan cari teman jalan." action={createBtn} />}
        </TabsContent>

        <TabsContent value="masuk" className="mt-4 space-y-3">
          {incoming?.length ? incoming.map((r: any) => {
            const [label, variant] = reqStatus[r.status]
            const who = personOf(r.requester_id)
            const c = r.status === 'approved' ? contactOf(r.requester_id) : null
            return (
              <Card key={r.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        {who?.avatar_url && <AvatarImage src={who.avatar_url} alt="" />}
                        <AvatarFallback className="bg-primary/15 text-primary">{(who?.full_name ?? '?').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{who?.full_name ?? 'Pengguna'}</p>
                        {who?.travel_style && <p className="text-xs text-muted-foreground">Gaya: {who.travel_style}</p>}
                        {who?.bio && <p className="mt-1 text-sm text-muted-foreground">{who.bio}</p>}
                        <p className="mt-2 text-sm">Ingin ikut: <b>{r.plans.title}</b> · {rentang(r.plans.start_date, r.plans.end_date)}</p>
                        {r.message && <p className="mt-1 text-sm">“{r.message}”</p>}
                      </div>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  {r.status === 'pending' && <div className="mt-3"><RequestActions id={r.id} name={who?.full_name} /></div>}
                  {c && <ContactCard c={c} reqId={r.id} />}
                </CardContent>
              </Card>
            )
          }) : <EmptyState icon={Inbox} title="Belum ada permintaan masuk" description="Permintaan ke rencanamu akan muncul di sini." />}
        </TabsContent>

        <TabsContent value="saya" className="mt-4 space-y-3">
          {mine?.length ? mine.map((r: any) => {
            const [label, variant] = reqStatus[r.status]
            const c = r.status === 'approved' ? contactOf(r.plans.creator_id) : null
            const done = r.plans.end_date < new Date().toISOString().slice(0, 10)
            return (
              <Card key={r.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/rencana/${r.plan_id}`} className="font-medium hover:text-primary">{r.plans.title}</Link>
                      <p className="text-sm text-muted-foreground">{rentang(r.plans.start_date, r.plans.end_date)}</p>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  {c && <ContactCard c={c} reqId={r.id} />}
                  {(r.status === 'pending' || r.status === 'approved') && !done && (
                    <div className="mt-3"><CancelJoinButton id={r.id} /></div>
                  )}
                </CardContent>
              </Card>
            )
          }) : <EmptyState icon={Send} title="Kamu belum mengajukan gabung" description="Cari rencana yang cocok di halaman Rencana."
              action={<Button asChild variant="outline"><Link href="/rencana">Lihat rencana</Link></Button>} />}
        </TabsContent>

        <TabsContent value="notifikasi" className="mt-4 space-y-3">
          {notifs?.length ? (
            <>
              {unread > 0 && <MarkReadButton />}
              <div className="divide-y rounded-2xl border bg-card">
                {notifs.map((n: any) => (
                  <Link key={n.id} href={n.link ?? '/dashboard'} className={cn('block px-4 py-3 text-sm hover:bg-accent', !n.is_read && 'bg-primary/5')}>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : <EmptyState icon={Bell} title="Belum ada notifikasi" description="Kabar permintaan gabung akan muncul di sini." />}
        </TabsContent>
      </Tabs>
    </>
  )
}