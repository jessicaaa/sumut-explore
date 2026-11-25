import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DestDeleteButton from '@/components/DestDeleteButton'
import { STATUS_UI } from '@/lib/dest'
import { budget } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Status Pengajuan' }

const evLabel: Record<string, string> = {
  draft: 'Disimpan sebagai draf',
  pending: 'Dikirim untuk verifikasi',
  verified: 'Disetujui admin',
  revision: 'Admin meminta revisi',
  rejected: 'Ditolak admin',
}
const dot: Record<string, string> = {
  draft: 'bg-muted-foreground', pending: 'bg-cta', verified: 'bg-primary', revision: 'bg-destructive', rejected: 'bg-destructive',
}

export default async function Status({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: d } = await supabase.from('destinations').select('*').eq('id', Number(id)).maybeSingle()
  if (!d || d.owner_id !== user?.id) notFound()
  const { data: events } = await supabase.from('destination_events').select('*')
    .eq('destination_id', d.id).order('created_at', { ascending: false })

  const s = STATUS_UI[d.status]
  const showNote = (d.status === 'revision' || d.status === 'rejected') && d.admin_note

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/owner" className="text-sm text-muted-foreground hover:text-foreground">← Destinasi Saya</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{d.name}</h1>
          <Badge variant={s.variant}>{s.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{s.hint}</p>
      </div>

      {showNote && (
        <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div><p className="font-medium">Catatan admin</p><p className="mt-1 whitespace-pre-line">{d.admin_note}</p></div>
        </div>
      )}
      {d.status === 'pending' && (
        <div className="flex gap-3 rounded-xl border bg-muted p-4 text-sm">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Pengajuan sedang ditinjau. Data tidak dapat diubah selama proses ini. Kamu akan mendapat notifikasi saat ada keputusan.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(d.status === 'revision' || d.status === 'rejected') && (
          <Button asChild className="bg-cta text-cta-foreground hover:bg-cta/90"><Link href={`/owner/destinasi/${d.id}/edit`}>Perbaiki & Kirim Ulang</Link></Button>
        )}
        {d.status === 'draft' && <Button asChild><Link href={`/owner/destinasi/${d.id}/edit`}>Lanjutkan pengisian</Link></Button>}
        {d.status === 'verified' && (
          <>
            <Button asChild variant="outline"><Link href={`/owner/destinasi/${d.id}/edit`}>Edit destinasi</Link></Button>
            <Button asChild variant="outline"><Link href={`/destinasi/${d.slug}`}><ExternalLink className="mr-1 h-4 w-4" />Lihat halaman publik</Link></Button>
          </>
        )}
        {(d.status === 'draft' || d.status === 'rejected') && <DestDeleteButton id={d.id} />}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ringkasan</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {d.photos?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {d.photos.map((p: string) => <img key={p} src={p} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />)}
            </div>
          )}
          <p><span className="text-muted-foreground">Kategori:</span> <span className="capitalize">{d.category ?? '-'}</span></p>
          <p><span className="text-muted-foreground">Lokasi:</span> {[d.address, d.city].filter(Boolean).join(', ') || '-'}</p>
          <p><span className="text-muted-foreground">Budget:</span> {budget(d.budget_min, d.budget_max)}</p>
          <p><span className="text-muted-foreground">Jam buka:</span> {d.open_hours ?? '-'}</p>
          <p><span className="text-muted-foreground">Bukti:</span> {d.proof_data?.jenis ?? 'Belum diisi'}{d.proof_url ? ' ✓ berkas terunggah' : ''}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Riwayat status</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative ml-2 space-y-5 border-l pl-6">
            {events?.map((e: any) => (
              <li key={e.id} className="relative">
                <span className={cn('absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-card', dot[e.status])} />
                <p className="text-sm font-medium">{evLabel[e.status]}</p>
                <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                {e.note && <p className="mt-1 text-sm">{e.note}</p>}
              </li>
            ))}
            {!events?.length && <li className="text-sm text-muted-foreground">Belum ada riwayat.</li>}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}