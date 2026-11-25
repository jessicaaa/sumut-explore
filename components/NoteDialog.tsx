'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function NoteDialog({
  trigger, title, description, confirmLabel, destructive, noteRequired = true, noteLabel = 'Catatan', onConfirm,
}: {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmLabel: string
  destructive?: boolean
  noteRequired?: boolean
  noteLabel?: string
  onConfirm: (note: string) => Promise<boolean | void>
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const short = noteRequired && note.trim().length < 3

  async function go() {
    setBusy(true)
    const ok = await onConfirm(note.trim())
    setBusy(false)
    if (ok !== false) { setOpen(false); setNote('') }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="note">{noteLabel}{noteRequired && ' *'}</Label>
          <Textarea id="note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button variant={destructive ? 'destructive' : 'default'} disabled={busy || short} onClick={go}>
            {busy ? 'Memproses…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}