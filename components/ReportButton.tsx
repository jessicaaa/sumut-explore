'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { field } from '@/lib/ui'

const cats: [string, string][] = [
  ['spam', 'Spam atau iklan'],
  ['mencurigakan', 'Mencurigakan / berpotensi penipuan'],
  ['palsu', 'Informasi palsu'],
  ['lainnya', 'Lainnya'],
]

export default function ReportButton({ planId }: { planId: number }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [category, setCategory] = useState('spam')
  const [detail, setDetail] = useState('')

  async function send() {
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return (window.location.href = '/login')
    const label = cats.find(([k]) => k === category)![1]
    const { error } = await supabase.from('reports').insert({
      plan_id: planId, reporter_id: user.id, category, reason: detail.trim() || label,
    })
    setBusy(false)
    if (error) return toast.error('Gagal mengirim laporan (mungkin terlalu banyak dalam satu jam).')
    toast.success('Laporan terkirim. Admin akan menindaklanjuti.')
    setDone(true)
    setOpen(false)
  }

  if (done) return <span className="text-xs text-muted-foreground">Sudah dilaporkan</span>
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <Flag className="h-3 w-3" />Laporkan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laporkan rencana</DialogTitle>
          <DialogDescription>Laporanmu dibaca admin dan ditindaklanjuti maksimal 2×24 jam.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cat">Alasan</Label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
              {cats.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detail">Keterangan tambahan (opsional)</Label>
            <Textarea id="detail" maxLength={300} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={busy} onClick={send}>{busy ? 'Mengirim…' : 'Kirim laporan'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}