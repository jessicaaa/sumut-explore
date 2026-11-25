'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { errText } from '@/lib/errors'

export default function JoinButton({ planId }: { planId: number }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [agree, setAgree] = useState(false)

  async function send() {
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return (window.location.href = `/login?next=${encodeURIComponent(pathname)}`)
    const { data: id, error } = await supabase.rpc('join_plan', {
      p_plan: planId, p_message: message.trim() || null,
    })
    setBusy(false)
    if (error) return toast.error(errText(error.message))
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'join', requestId: id }),
    })
    toast.success('Permintaan terkirim.')
    setSent(true)
    setOpen(false)
    router.refresh()
  }

  if (sent) return <Badge variant="secondary">Menunggu persetujuan</Badge>
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ size: 'sm', className: 'bg-cta text-cta-foreground hover:bg-cta/90' })}>
        Ajukan Gabung
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan gabung</DialogTitle>
          <DialogDescription>Perkenalkan dirimu singkat supaya pembuat rencana mudah memutuskan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="msg">Pesan (opsional)</Label>
            <Textarea
              id="msg"
              maxLength={200}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Halo, aku biasa jalan santai dan suka foto-foto…"
            />
            <p className="text-right text-xs text-muted-foreground">{message.length}/200</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
            <span>Saya setuju WhatsApp/Instagram saya dibagikan ke pembuat rencana bila permintaan ini disetujui.</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={!agree || busy} onClick={send}>{busy ? 'Mengirim…' : 'Kirim permintaan'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}