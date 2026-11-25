import Link from 'next/link'
import { AlertTriangle, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ReportActions from '@/components/ReportActions'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { REPORT_SLA_HOURS } from '@/lib/config'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Laporan' }

const nowMs = () => new Date().getTime()
const dur = (h: number) => {
  const a = Math.abs(h)
  return a >= 24 ? `${Math.floor(a / 24)} hari ${Math.floor(a % 24)} jam` : `${Math.max(1, Math.floor(a))} jam`
}
const catLabel: Record<string, string> = { spam: 'Spam', mencurigakan: 'Mencurigakan', palsu: 'Info palsu', lainnya: 'Lainnya' }
const statusLabel: Record<string, string> = {
  dismissed: 'Diabaikan', warned: 'Diperingatkan', plan_removed: 'Rencana dihapus', account_disabled: 'Akun dinonaktifkan',
}

export default async function Laporan({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = 'open' } = await searchParams
  const supabase = await createClient()

  let q = supabase.from('reports').select('*').limit(100)
  q = status === 'open' ? q.eq('status', 'open').order('created_at', { ascending: true })
    : q.neq('status', 'open').order('handled_at', { ascending: false })
  const { data } = await q

  const ids = [...new Set((data ?? []).flatMap((r) => [r.reporter_id, r.reported_user_id]).filter(Boolean))]
  const { data: people } = ids.length
    ? await supabase.from('profiles').select('id,full_name').in('id', ids)
    : { data: [] as { id: string; full_name: string }[] }
  const nameOf = (id?: string | null) => people?.find((p) => p.id === id)?.full_name ?? '-'

  const tab = (v: string, label: string) => (
    <Link href={`?status=${v}`} className={cn('rounded-full border px-3 py-1 text-sm', status === v ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent')}>{label}</Link>
  )

  return (
    <>
      <PageHeader title="Laporan" description={`Tindak lanjut maksimal ${REPORT_SLA_HOURS} jam (2×24 jam) sejak laporan masuk.`} />
      <div className="mb-6 flex gap-2">{tab('open', 'Terbuka')}{tab('selesai', 'Selesai')}</div>

      {data?.length ? (
        <div className="space-y-3">
          {data.map((r) => {
            const open = r.status === 'open'
            const left = REPORT_SLA_HOURS - (nowMs() - new Date(r.created_at).getTime()) / 3600000
            const urgent = open && left <= 12
            return (
              <Card key={r.id} className={cn(urgent && 'border-destructive/60')}>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{catLabel[r.category] ?? r.category}</Badge>
                        {r.plan_id
                          ? <Link href={`/rencana/${r.plan_id}`} className="font-medium hover:text-primary">{r.plan_title ?? 'Rencana'}</Link>
                          : <span className="font-medium">{r.plan_title ?? 'Rencana'} <span className="font-normal text-muted-foreground">(sudah dihapus)</span></span>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pelapor: {nameOf(r.reporter_id)} · Terlapor: {nameOf(r.reported_user_id)} · {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    {open
                      ? <Badge variant={urgent ? 'destructive' : 'outline'} className="gap-1">{urgent && <AlertTriangle className="h-3 w-3" />}{left < 0 ? `Lewat batas ${dur(left)}` : `Sisa ${dur(left)}`}</Badge>
                      : <Badge variant="outline">{statusLabel[r.status] ?? r.status}</Badge>}
                  </div>
                  <p className="text-sm">“{r.reason}”</p>
                  {open
                    ? <ReportActions id={r.id} canRemovePlan={!!r.plan_id} canDisable={!!r.reported_user_id} />
                    : r.handled_note && <p className="text-sm text-muted-foreground">Catatan tindak lanjut: {r.handled_note}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState icon={Flag} title={status === 'open' ? 'Tidak ada laporan terbuka' : 'Belum ada laporan selesai'} />
      )}
    </>
  )
}