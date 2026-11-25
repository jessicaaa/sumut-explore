'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { logAdmin } from '@/lib/adminlog'
import { CATEGORIES } from '@/lib/config'
import { field } from '@/lib/ui'
import { hoursFromJson, hoursSummary, hoursToJson, hoursValid, inSumut, parseCoords, type Hours } from '@/lib/dest'
import HoursEditor from './HoursEditor'
import PhotoUploader from './PhotoUploader'
import ConfirmDialog from './ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const num = (v: string) => (v === '' ? null : Number(v))

export default function AdminDestForm({ userId, initial }: { userId: string; initial?: any }) {
  const supabase = createClient()
  const router = useRouter()
  const statusEditable = !initial || ['verified', 'draft'].includes(initial.status)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    maps_url: initial?.maps_url ?? '',
    coords: initial?.lat != null ? `${initial.lat}, ${initial.lng}` : '',
    budget_min: initial?.budget_min != null ? String(initial.budget_min) : '',
    budget_max: initial?.budget_max != null ? String(initial.budget_max) : '',
    status: initial?.status ?? 'verified',
  })
  const [hasHours, setHasHours] = useState(initial ? !!initial.opening_hours : true)
  const [hours, setHours] = useState<Hours>(hoursFromJson(initial?.opening_hours ?? null))
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<any>) => setF((s) => ({ ...s, [k]: e.target.value }))

  const parsed = parseCoords(f.coords)
  const coords = parsed && inSumut(parsed.lat, parsed.lng) ? parsed : null
  const coordsMsg = !f.coords.trim() ? '' : !parsed ? 'Format: latitude, longitude.' : !coords ? 'Koordinat di luar Sumatera Utara.' : ''

  async function save() {
    if (!f.name.trim() || !f.category || !f.city.trim()) return toast.error('Nama, kategori, dan kota wajib diisi.')
    if (coordsMsg) return toast.error(coordsMsg)
    if (hasHours && !hoursValid(hours)) return toast.error('Jam tutup harus setelah jam buka.')
    if (f.budget_min && f.budget_max && Number(f.budget_max) < Number(f.budget_min))
      return toast.error('Budget maksimal harus ≥ budget minimal.')

    const payload: Record<string, unknown> = {
      name: f.name.trim(),
      category: f.category,
      description: f.description.trim() || null,
      city: f.city.trim(),
      address: f.address.trim() || null,
      maps_url: f.maps_url.trim() || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      budget_min: num(f.budget_min),
      budget_max: num(f.budget_max),
      opening_hours: hasHours ? hoursToJson(hours) : null,
      open_hours: hasHours ? hoursSummary(hours) : null,
      photos,
    }
    if (statusEditable) payload.status = f.status

    setBusy(true)
    const res = initial?.id
      ? await supabase.from('destinations').update(payload).eq('id', initial.id).select('id').single()
      : await supabase.from('destinations').insert(payload).select('id').single()
    setBusy(false)
    if (res.error) return toast.error('Gagal menyimpan: ' + res.error.message)

    await logAdmin(supabase, initial?.id ? 'dest_edit' : 'dest_create', 'destination', res.data.id, String(payload.name))
    toast.success('Destinasi disimpan.')
    router.push('/admin/destinasi')
    router.refresh()
  }

  async function remove() {
    const { data, error } = await supabase.from('destinations').delete().eq('id', initial.id).select('id')
    if (error || !data?.length)
      return toast.error('Tidak bisa dihapus (kemungkinan dipakai rencana). Ubah status jadi Draf untuk menyembunyikan.')
    await logAdmin(supabase, 'dest_delete', 'destination', initial.id, initial.name)
    toast.success('Destinasi dihapus.')
    router.push('/admin/destinasi')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="name">Nama destinasi *</Label>
            <Input id="name" value={f.name} maxLength={80} onChange={set('name')} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="cat">Kategori *</Label>
              <select id="cat" className={cn(field, 'capitalize')} value={f.category} onChange={set('category')}>
                <option value="">Pilih kategori</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div className="space-y-1.5"><Label htmlFor="city">Kota / kabupaten *</Label>
              <Input id="city" value={f.city} onChange={set('city')} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="desc">Deskripsi</Label>
            <Textarea id="desc" rows={5} maxLength={1000} value={f.description} onChange={set('description')} /></div>
          <div className="space-y-1.5"><Label htmlFor="addr">Alamat</Label>
            <Textarea id="addr" rows={2} value={f.address} onChange={set('address')} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="coords">Koordinat (untuk peta dan cuaca)</Label>
              <Input id="coords" value={f.coords} placeholder="2.9167, 98.5167" onChange={set('coords')} />
              {coordsMsg && <p className="text-xs text-destructive">{coordsMsg}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="maps">Tautan Google Maps</Label>
              <Input id="maps" type="url" value={f.maps_url} onChange={set('maps_url')} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="bmin">Budget minimal (Rp)</Label>
              <Input id="bmin" type="number" min={0} value={f.budget_min} onChange={set('budget_min')} /></div>
            <div className="space-y-1.5"><Label htmlFor="bmax">Budget maksimal (Rp)</Label>
              <Input id="bmax" type="number" min={0} value={f.budget_max} onChange={set('budget_max')} /></div>
          </div>
          {statusEditable && (
            <div className="space-y-1.5"><Label htmlFor="status">Status</Label>
              <select id="status" className={field} value={f.status} onChange={set('status')}>
                <option value="verified">Tayang (terverifikasi)</option>
                <option value="draft">Draf (disembunyikan)</option>
              </select></div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={hasHours} onCheckedChange={(v) => setHasHours(v === true)} />Jam buka diketahui
          </label>
          {hasHours && <HoursEditor value={hours} onChange={setHours} />}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">Foto (maks. 5, foto pertama jadi sampul)</h2>
          <PhotoUploader userId={userId} urls={photos} onChange={setPhotos} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {initial?.id ? (
          <ConfirmDialog trigger={<Button variant="ghost" className="text-destructive">Hapus destinasi</Button>}
            title="Hapus destinasi ini?" description="Tidak bisa dibatalkan." confirmLabel="Hapus" destructive onConfirm={remove} />
        ) : <span />}
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link href="/admin/destinasi">Batal</Link></Button>
          <Button disabled={busy} onClick={save}>{busy ? 'Menyimpan…' : 'Simpan'}</Button>
        </div>
      </div>
    </div>
  )
}