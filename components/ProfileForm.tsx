'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image'
import { TRAVEL_STYLES } from '@/lib/config'
import { field } from '@/lib/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ProfileForm({ p, email }: { p: any; email: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [avatar, setAvatar] = useState<string | null>(p.avatar_url)
  const [busy, setBusy] = useState(false)

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('File harus berupa gambar.')
    if (file.size > 10 * 1024 * 1024) return toast.error('Ukuran maksimal 10 MB.')
    setBusy(true)
    try {
      const blob = await compressImage(file, 512, 0.85)
      const path = `${p.id}/avatar-${Date.now()}.jpg`
      const up = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' })
      if (up.error) throw up.error
      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', p.id)
      if (error) throw error
      setAvatar(url)
      toast.success('Foto diperbarui.')
      router.refresh()
    } catch {
      toast.error('Gagal mengunggah foto.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const wa = String(fd.get('whatsapp') ?? '').replace(/\D/g, '').replace(/^0/, '62')
    setBusy(true)
    const { error } = await supabase.from('profiles').update({
      full_name: String(fd.get('full_name')).trim(),
      bio: String(fd.get('bio') ?? '').trim() || null,
      travel_style: String(fd.get('travel_style') ?? '') || null,
      whatsapp: wa || null,
      instagram: String(fd.get('instagram') ?? '').replace(/^@/, '').trim() || null,
    }).eq('id', p.id)
    setBusy(false)
    if (error) return toast.error('Gagal menyimpan profil.')
    toast.success('Profil disimpan.')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {avatar && <AvatarImage src={avatar} alt="" />}
            <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
              {p.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <Camera className="h-4 w-4" />Ganti foto
              <input type="file" accept="image/*" className="sr-only" onChange={onAvatar} disabled={busy} />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Otomatis dikecilkan. {email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="full_name">Nama lengkap</Label>
            <Input id="full_name" name="full_name" defaultValue={p.full_name} required /></div>
          <div className="space-y-1.5"><Label htmlFor="bio">Bio singkat</Label>
            <Textarea id="bio" name="bio" rows={3} maxLength={200} defaultValue={p.bio ?? ''}
              placeholder="Ceritakan dirimu singkat. Pembuat rencana akan membacanya saat kamu mengajukan gabung." /></div>
          <div className="space-y-1.5"><Label htmlFor="travel_style">Gaya traveling</Label>
            <select id="travel_style" name="travel_style" defaultValue={p.travel_style ?? ''} className={field}>
              <option value="">Pilih gaya</option>
              {TRAVEL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" defaultValue={p.whatsapp ?? ''} placeholder="08xx atau 628xx" /></div>
            <div className="space-y-1.5"><Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" defaultValue={p.instagram ?? ''} placeholder="tanpa @" /></div>
          </div>
          <div className="flex gap-3 rounded-lg bg-primary/5 p-3 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>Kontak ini <b>tidak tampil di halaman publik</b>. Hanya terlihat oleh pihak yang saling disetujui dalam satu rencana. Bio, gaya traveling, dan foto terlihat oleh pembuat rencana yang kamu ajukan.</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan profil'}</Button>
    </form>
  )
}