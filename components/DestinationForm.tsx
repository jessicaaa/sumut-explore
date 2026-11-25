'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle, Check, ExternalLink, FileCheck2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/image'
import { CATEGORIES } from '@/lib/config'
import { field } from '@/lib/ui'
import {
  hoursFromJson, hoursSummary, hoursToJson, hoursValid, inSumut, parseCoords, type Hours,
} from '@/lib/dest'
import HoursEditor from './HoursEditor'
import PhotoUploader from './PhotoUploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const steps = ['Info dasar', 'Lokasi', 'Operasional', 'Foto', 'Bukti']
const PROOF_TYPES = [
  'Surat izin usaha / NIB',
  'Sertifikat atau bukti kepemilikan lahan',
  'Surat keterangan desa / kelurahan / dinas',
  'Surat kuasa pengelola',
  'Lainnya (papan nama / karcis resmi)',
]
const RELATIONS = ['Pemilik', 'Pengelola', 'Perwakilan resmi']
const num = (v: string) => (v === '' ? null : Number(v))

export default function DestinationForm({ userId, initial }: { userId: string; initial?: any }) {
  const supabase = createClient()
  const router = useRouter()
  const status0: string | undefined = initial?.status
  const isVerified = status0 === 'verified'
  const resubmit = status0 === 'revision' || status0 === 'rejected'

  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    budget_min: initial?.budget_min != null ? String(initial.budget_min) : '',
    budget_max: initial?.budget_max != null ? String(initial.budget_max) : '',
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    maps_url: initial?.maps_url ?? '',
    coords: initial?.lat != null ? `${initial.lat}, ${initial.lng}` : '',
  })
  const [hours, setHours] = useState<Hours>(hoursFromJson(initial?.opening_hours ?? null))
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])
  const [proofPath, setProofPath] = useState<string>(initial?.proof_url ?? '')
  const [proofName, setProofName] = useState('')
  const [proof, setProof] = useState({
    jenis: initial?.proof_data?.jenis ?? '',
    nomor: initial?.proof_data?.nomor ?? '',
    penanggung_jawab: initial?.proof_data?.penanggung_jawab ?? '',
    kontak: initial?.proof_data?.kontak ?? '',
    hubungan: initial?.proof_data?.hubungan ?? '',
    pernyataan: !!initial?.proof_data?.pernyataan,
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<any>) => setF((s) => ({ ...s, [k]: e.target.value }))
  const setP = (k: keyof typeof proof, v: string | boolean) => setProof((s) => ({ ...s, [k]: v }))

  const parsed = parseCoords(f.coords)
  const coords = parsed && inSumut(parsed.lat, parsed.lng) ? parsed : null
  const coordsMsg = !f.coords.trim() ? '' : !parsed ? 'Format: -latitude, longitude (contoh 2.9167, 98.5167).' : !coords ? 'Koordinat di luar Sumatera Utara.' : ''

  const missing = useMemo(() => {
    const m: string[] = []
    if (!f.name.trim()) m.push('Nama destinasi')
    if (!f.category) m.push('Kategori')
    if (f.description.trim().length < 30) m.push('Deskripsi (min. 30 karakter)')
    if (!f.city.trim()) m.push('Kota/kabupaten')
    if (!f.address.trim()) m.push('Alamat')
    if (!coords) m.push('Koordinat valid')
    if (!hoursValid(hours)) m.push('Jam buka (jam tutup harus setelah jam buka)')
    if (photos.length < 3) m.push(`Foto (kurang ${3 - photos.length})`)
    if (!proof.jenis) m.push('Jenis bukti')
    if (!proof.nomor.trim()) m.push('Nomor/nama dokumen')
    if (!proof.penanggung_jawab.trim()) m.push('Nama penanggung jawab')
    if (!proof.kontak.trim()) m.push('Kontak penanggung jawab')
    if (!proof.hubungan) m.push('Hubungan dengan destinasi')
    if (!proofPath) m.push('Berkas bukti')
    if (!proof.pernyataan) m.push('Pernyataan kebenaran data')
    return m
  }, [f, coords, hours, photos, proof, proofPath])

  const majorChanged = isVerified && (
    f.name.trim() !== initial.name || f.city.trim() !== (initial.city ?? '') ||
    f.address.trim() !== (initial.address ?? '') || proofPath !== initial.proof_url ||
    (coords && (coords.lat !== initial.lat || coords.lng !== initial.lng))
  )

  async function onProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!okTypes.includes(file.type)) return toast.error('Berkas harus JPG, PNG, WebP, atau PDF.')
    if (file.type === 'application/pdf' && file.size > 5 * 1024 * 1024) return toast.error('PDF maksimal 5 MB.')
    if (file.size > 10 * 1024 * 1024) return toast.error('Ukuran maksimal 10 MB.')
    setBusy(true)
    try {
      const isImg = file.type.startsWith('image/')
      const body: Blob = isImg ? await compressImage(file, 2000, 0.85) : file
      const path = `${userId}/proof-${Date.now()}.${isImg ? 'jpg' : 'pdf'}`
      const up = await supabase.storage.from('proofs').upload(path, body, { contentType: isImg ? 'image/jpeg' : 'application/pdf' })
      if (up.error) throw up.error
      setProofPath(path)
      setProofName(file.name)
      toast.success('Berkas bukti terunggah.')
    } catch {
      toast.error('Gagal mengunggah berkas.')
    } finally {
      setBusy(false)
    }
  }

  async function save(mode: 'draft' | 'submit' | 'update') {
    if (!f.name.trim()) return toast.error('Isi nama destinasi dulu.')
    if (f.budget_min && f.budget_max && Number(f.budget_max) < Number(f.budget_min))
      return toast.error('Budget maksimal harus ≥ budget minimal.')
    if (coordsMsg) return toast.error(coordsMsg)

    const payload = {
      name: f.name.trim(),
      category: f.category || null,
      description: f.description.trim() || null,
      budget_min: num(f.budget_min),
      budget_max: num(f.budget_max),
      city: f.city.trim() || null,
      address: f.address.trim() || null,
      maps_url: f.maps_url.trim() || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      opening_hours: hoursToJson(hours),
      open_hours: hoursSummary(hours),
      photos,
      proof_url: proofPath || null,
      proof_data: { ...proof, pernyataan: proof.pernyataan },
      status: mode === 'draft' ? 'draft' : mode === 'submit' ? 'pending' : 'verified',
    }

    setBusy(true)
    const res = initial?.id
      ? await supabase.from('destinations').update(payload).eq('id', initial.id).select('id,status').single()
      : await supabase.from('destinations').insert({ ...payload, owner_id: userId }).select('id,status').single()
    setBusy(false)

    if (res.error) {
      const m = res.error.message
      return toast.error(
        m.includes('INCOMPLETE') ? 'Data belum lengkap.'
        : m.includes('LOCKED_PENDING') ? 'Sedang ditinjau admin, belum bisa diubah.'
        : 'Gagal menyimpan: ' + m
      )
    }
    toast.success(
      res.data.status === 'pending'
        ? isVerified ? 'Perubahan besar terdeteksi: destinasi masuk verifikasi ulang.' : 'Terkirim untuk verifikasi.'
        : mode === 'draft' ? 'Draf disimpan.' : 'Perubahan disimpan.'
    )
    router.push(`/owner/destinasi/${res.data.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)}
              className={cn('flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
                i === step ? 'border-primary bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent')}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-muted text-xs">{i + 1}</span>{s}
            </button>
          </li>
        ))}
      </ol>

      {majorChanged && (
        <div className="flex gap-3 rounded-xl border border-cta/40 bg-cta/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-cta" />
          <p>Perubahan pada nama, lokasi, atau bukti memicu <b>verifikasi ulang</b>. Selama ditinjau, destinasi disembunyikan dari halaman publik.</p>
        </div>
      )}

      <Card>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1.5"><Label htmlFor="name">Nama destinasi *</Label>
                <Input id="name" value={f.name} maxLength={80} onChange={set('name')} /></div>
              <div className="space-y-1.5"><Label htmlFor="cat">Kategori *</Label>
                <select id="cat" className={cn(field, 'capitalize')} value={f.category} onChange={set('category')}>
                  <option value="">Pilih kategori</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div className="space-y-1.5"><Label htmlFor="desc">Deskripsi * (min. 30 karakter)</Label>
                <Textarea id="desc" rows={5} maxLength={1000} value={f.description} onChange={set('description')} />
                <p className="text-right text-xs text-muted-foreground">{f.description.length}/1000</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="bmin">Budget minimal (Rp)</Label>
                  <Input id="bmin" type="number" min={0} step={5000} value={f.budget_min} onChange={set('budget_min')} /></div>
                <div className="space-y-1.5"><Label htmlFor="bmax">Budget maksimal (Rp)</Label>
                  <Input id="bmax" type="number" min={0} step={5000} value={f.budget_max} onChange={set('budget_max')} /></div>
              </div>
              <p className="text-xs text-muted-foreground">Budget = kisaran biaya per orang (tiket, parkir, makan, dsb.). Isi 0 bila gratis.</p>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1.5"><Label htmlFor="city">Kota / kabupaten *</Label>
                <Input id="city" value={f.city} placeholder="Contoh: Simalungun" onChange={set('city')} /></div>
              <div className="space-y-1.5"><Label htmlFor="addr">Alamat lengkap *</Label>
                <Textarea id="addr" rows={2} value={f.address} onChange={set('address')} /></div>
              <div className="space-y-1.5"><Label htmlFor="coords">Koordinat *</Label>
                <Input id="coords" value={f.coords} placeholder="2.9167, 98.5167" onChange={set('coords')} />
                {coordsMsg
                  ? <p className="text-xs text-destructive">{coordsMsg}</p>
                  : <p className="text-xs text-muted-foreground">Di Google Maps: klik kanan titik lokasi, lalu klik angka koordinat paling atas untuk menyalin, dan tempel di sini.</p>}
                <a href="https://www.google.com/maps" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Buka Google Maps<ExternalLink className="h-3 w-3" /></a></div>
              <div className="space-y-1.5"><Label htmlFor="maps">Tautan Google Maps (opsional)</Label>
                <Input id="maps" type="url" value={f.maps_url} placeholder="https://maps.app.goo.gl/…" onChange={set('maps_url')} /></div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-semibold">Jam buka per hari *</h2>
              <HoursEditor value={hours} onChange={setHours} />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-semibold">Foto destinasi * (3–5 foto)</h2>
              <PhotoUploader userId={userId} urls={photos} onChange={setPhotos} />
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-semibold">Bukti kepemilikan / pengelolaan *</h2>
              <p className="text-sm text-muted-foreground">Admin memakai data ini untuk memverifikasi. Berkas hanya terlihat olehmu dan admin.</p>
              <div className="space-y-1.5"><Label htmlFor="jenis">Jenis bukti</Label>
                <select id="jenis" className={field} value={proof.jenis} onChange={(e) => setP('jenis', e.target.value)}>
                  <option value="">Pilih jenis bukti</option>
                  {PROOF_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div className="space-y-1.5"><Label htmlFor="nomor">Nomor / nama dokumen</Label>
                <Input id="nomor" value={proof.nomor} onChange={(e) => setP('nomor', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="pj">Nama penanggung jawab</Label>
                  <Input id="pj" value={proof.penanggung_jawab} onChange={(e) => setP('penanggung_jawab', e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="kp">WhatsApp penanggung jawab</Label>
                  <Input id="kp" value={proof.kontak} placeholder="08xx" onChange={(e) => setP('kontak', e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="hub">Hubunganmu dengan destinasi</Label>
                <select id="hub" className={field} value={proof.hubungan} onChange={(e) => setP('hubungan', e.target.value)}>
                  <option value="">Pilih</option>
                  {RELATIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div className="space-y-1.5">
                <Label>Berkas bukti (JPG/PNG/WebP/PDF, maks 5 MB untuk PDF)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                    <FileCheck2 className="h-4 w-4" />{proofPath ? 'Ganti berkas' : 'Pilih berkas'}
                    <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onProof} disabled={busy} />
                  </label>
                  {proofPath && <span className="flex items-center gap-1 text-sm text-primary"><Check className="h-4 w-4" />{proofName || 'Berkas sudah diunggah'}</span>}
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={proof.pernyataan} onCheckedChange={(v) => setP('pernyataan', v === true)} className="mt-0.5" />
                <span>Saya menyatakan data dan bukti di atas benar. Data palsu dapat menyebabkan destinasi ditolak dan akun dinonaktifkan.</span>
              </label>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {!isVerified && missing.length > 0 && (
          <p className="text-sm text-muted-foreground"><b>Belum lengkap untuk dikirim:</b> {missing.join(', ')}.</p>
        )}
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>Kembali</Button>
            {step < steps.length - 1 && <Button disabled={busy} onClick={() => setStep(step + 1)}>Lanjut</Button>}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost"><Link href={initial?.id ? `/owner/destinasi/${initial.id}` : '/owner'}>Batal</Link></Button>
            {isVerified ? (
              <Button disabled={busy || missing.length > 0} onClick={() => save('update')}>Simpan perubahan</Button>
            ) : (
              <>
                <Button variant="outline" disabled={busy} onClick={() => save('draft')}>Simpan Draf</Button>
                <Button disabled={busy || missing.length > 0} onClick={() => save('submit')}
                  className="bg-cta text-cta-foreground hover:bg-cta/90">
                  {resubmit ? 'Perbaiki & Kirim Ulang' : 'Kirim untuk Verifikasi'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}