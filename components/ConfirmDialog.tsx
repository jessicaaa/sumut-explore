'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function ConfirmDialog({ trigger, title, description, confirmLabel = 'Ya', destructive, onConfirm }: {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => unknown
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function go() {
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false); setOpen(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button variant={destructive ? 'destructive' : 'default'} disabled={busy} onClick={go}>
            {busy ? 'Memproses…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}