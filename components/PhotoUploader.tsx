'use client'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const OK = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PHOTOS = 5

export default function PhotoUploader({ userId, urls, onChange }: {
  userId: string; urls: string[]; onChange: (u: string[]) => void
}) {
  const supabase = createClient()
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    const room = MAX_PHOTOS - urls.length
    if (!files.length) return
    if (room <= 0) return toast.error(`Maksimal ${MAX_PHOTOS} foto.`)
    if (files.length > room) toast.message(`Hanya ${room} foto pertama yang dipakai.`)

    setBusy(true)
    const added: string[] = []
    for (const file of files.slice(0, room)) {
      if (!OK.includes(file.type)) { toast.error(`${file.name}: hanya JPG, PNG, atau WebP.`); continue }
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name}: maksimal 10 MB.`); continue }
      try {
        const blob = await compressImage(file, 1600, 0.82)
        const path = `${userId}/dest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`
        const up = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })
        if (up.error) throw up.error
        added.push(supabase.storage.from('photos').getPublicUrl(path).data.publicUrl)
      } catch {
        toast.error(`${file.name}: gagal diunggah.`)
      }
    }
    setBusy(false)
    if (added.length) onChange([...urls, ...added])
  }

  const remove = (i: number) => onChange(urls.filter((_, k) => k !== i))
  const makeCover = (i: number) => onChange([urls[i], ...urls.filter((_, k) => k !== i)])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {urls.map((u, i) => (
          <div key={u} className="relative overflow-hidden rounded-xl border">
            <img src={u} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
            <button type="button" onClick={() => remove(i)} aria-label="Hapus foto"
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/90 shadow hover:bg-destructive hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-1.5 left-1.5">
              {i === 0
                ? <Badge>Sampul</Badge>
                : <Button type="button" size="sm" variant="secondary" className="h-6 px-2 text-xs" onClick={() => makeCover(i)}>Jadikan sampul</Button>}
            </div>
          </div>
        ))}
        {urls.length < MAX_PHOTOS && (
          <button type="button" disabled={busy} onClick={() => ref.current?.click()}
            className="grid aspect-[4/3] place-items-center rounded-xl border-2 border-dashed text-sm text-muted-foreground hover:bg-accent disabled:opacity-60">
            <span className="flex flex-col items-center gap-1">
              <ImagePlus className="h-6 w-6" />{busy ? 'Mengunggah…' : 'Tambah foto'}
            </span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={onPick} />
      <p className="text-xs text-muted-foreground">
        {urls.length}/{MAX_PHOTOS} foto (minimal 3). JPG/PNG/WebP, maks 10 MB per foto. Otomatis dikecilkan.
      </p>
    </div>
  )
}