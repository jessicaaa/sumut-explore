import Link from 'next/link'
import { AlertTriangle, ClipboardCheck, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import PageHeader from '@/components/PageHeader'
import { MOV } from '@/lib/config'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Admin' }

type Stats = {
  plans_total: number; plans_with_request: number; approved_total: number; approved_contact: number
  new_dest: number; pending_dest: number; open_reports: number; overdue_reports: number
  weekly: { week: string; n: number }[]
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0)
const fmt = (n: number) => n.toString().replace('.', ',')

function Mov({ title, value, display, target, targetLabel, note }: {
  title: string; value: number; display: string; target: number; targetLabel: string; note?: string
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {value >= target && <Badge>Tercapai</Badge>}
        </div>
        <p className="text-3xl font-bold">{display}</p>
        <Progress value={Math.min(100, (value / target) * 100)} />
        <p className="text-xs text-muted-foreground">Target {targetLabel}{note ? ` · ${note}` : ''}</p>
      </CardContent>
    </Card>
  )
}

export default async function AdminHome() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_stats')
  if (error || !data) return <p className="text-sm text-destructive">Gagal memuat statistik. Pastikan SQL Fase 5 sudah dijalankan.</p>
  const s = data as Stats

  const joinRate = pct(s.plans_with_request, s.plans_total)
  const contactRate = pct(s.approved_contact, s.approved_total)
  const max = Math.max(1, ...s.weekly.map((w) => w.n))

  return (
    <>
      <PageHeader title="Ringkasan" description="Pantau pencapaian MOV pilot dan antrean tugas." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Mov title="Rencana perjalanan dibuat" value={s.plans_total} display={`${s.plans_total} / ${MOV.plans}`}
          target={MOV.plans} targetLabel={`≥ ${MOV.plans} rencana`} />
        <Mov title="Rencana yang menerima permintaan gabung" value={joinRate} display={`${fmt(joinRate)}%`}
          target={MOV.joinRate} targetLabel={`≥ ${MOV.joinRate}%`} note={`${s.plans_with_request} dari ${s.plans_total}`} />
        <Mov title="Persetujuan berlanjut ke kontak" value={contactRate} display={`${fmt(contactRate)}%`}
          target={MOV.contactRate} targetLabel={`≥ ${MOV.contactRate}%`} note={`${s.approved_contact} dari ${s.approved_total}`} />
        <Mov title="Destinasi baru dari owner (terverifikasi)" value={s.new_dest} display={`${s.new_dest} / ${MOV.newDest}`}
          target={MOV.newDest} targetLabel={`≥ ${MOV.newDest} destinasi`} />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/pengajuan?status=pending">
          <Card className="transition hover:shadow-md"><CardContent className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-6 w-6" /></span>
            <div><p className="text-2xl font-bold">{s.pending_dest}</p><p className="text-sm text-muted-foreground">Pengajuan menunggu verifikasi</p></div>
          </CardContent></Card>
        </Link>
        <Link href="/admin/laporan">
          <Card className={cn('transition hover:shadow-md', s.overdue_reports > 0 && 'border-destructive/60')}><CardContent className="flex items-center gap-4">
            <span className={cn('grid h-12 w-12 place-items-center rounded-xl', s.overdue_reports > 0 ? 'bg-destructive/10 text-destructive' : 'bg-cta/15 text-cta')}>
              {s.overdue_reports > 0 ? <AlertTriangle className="h-6 w-6" /> : <Flag className="h-6 w-6" />}
            </span>
            <div>
              <p className="text-2xl font-bold">{s.open_reports}</p>
              <p className="text-sm text-muted-foreground">Laporan terbuka</p>
              {s.overdue_reports > 0 && <p className="text-xs font-medium text-destructive">{s.overdue_reports} mendekati / melewati batas 2×24 jam</p>}
            </div>
          </CardContent></Card>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Rencana dibuat per minggu (8 minggu terakhir)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {s.weekly.map((w) => (
              <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium">{w.n}</span>
                <div className="flex h-28 w-full items-end">
                  <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max((w.n / max) * 100, 2)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{w.week}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Definisi: <b>berlanjut ke kontak</b> = salah satu pihak membuka tautan WhatsApp/Instagram dari kartu kontak setelah disetujui
        (dihitung sejak fitur ini aktif). <b>Destinasi baru</b> = destinasi yang diajukan owner dan sudah terverifikasi.
      </p>
    </>
  )
}