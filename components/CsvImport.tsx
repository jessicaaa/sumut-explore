'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Download, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logAdmin } from '@/lib/adminlog'
import { parseCsv } from '@/lib/csv'
import { CATEGORIES, DAYS } from '@/lib/config'
import { inSumut } from '@/lib/dest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const HEADERS = ['nama', 'kategori', 'kota', 'alamat', 'lat', 'lng', 'budget_min', 'budget_max', 'jam_buka', 'deskripsi', 'foto', 'maps_url']
const TIME = /^(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})$/

type Item = { line: number; name: string; status: 'ok' | 'error' | 'skip'; msg?: string; row?: Record<string, unknown> }

function build(text: string, existing: Set<string>): Item[] {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('File kosong atau hanya berisi header.')
  const head = rows[0].map((h) => h.trim().toLowerCase())
  const idx: Record<string, number> = {}
  HEADERS.forEach((h) => (idx[h] = head.indexOf(h)))
  const miss = ['nama', 'kategori', 'kota'].filter((h) => idx[h] < 0)
  if (miss.length) throw new Error('Kolom wajib tidak ada: ' + miss.join(', '))

  const seen = new Set(existing)
  return rows.slice(1).map((c, i): Item => {
    const line = i + 2
    const g = (k: string) => (idx[k] >= 0 ? (c[idx[k]] ?? '').trim() : '')
    const name = g('nama')
    const err = (msg: string): Item => ({ line, name: name || '(kosong)', status: 'error', msg })
    if (!name) return err('Nama kosong')
    if (name.toUpperCase().startsWith('CONTOH')) return { line, name, status: 'skip', msg: 'Baris contoh' }

    const category = g('kategori').toLowerCase()
    if (!CATEGORIES.includes(category)) return err(`Kategori harus: ${CATEGORIES.join(', ')}`)
    const city = g('kota')
    if (!city) return err('Kota kosong')
    const key = `${name.toLowerCase()}|${city.toLowerCase()}`
    if (seen.has(key)) return { line, name, status: 'skip', msg: 'Sudah ada' }

    const latS = g('lat').replace(',', '.')
    const lngS = g('lng').replace(',', '.')
    let lat: number | null = null
    let lng: number | null = null
    if (latS || lngS) {
      lat = Number(latS)
      lng = Number(lngS)
      if (!latS || !lngS || Number.isNaN(lat) || Number.isNaN(lng) || !inSumut(lat, lng))
        return err('Koordinat tidak valid atau di luar Sumatera Utara')
    }

    const bn = (k: string) => { const v = g(k).replace(/[^\d]/g, ''); return v ? Number(v) : null }
    const bmin = bn('budget_min')
    const bmax = bn('budget_max')
    if (bmin != null && bmax != null && bmax < bmin) return err('Budget maksimal < minimal')

    const jam = g('jam_buka')
    let opening_hours: Record<string, string> | null = null
    let open_hours: string | null = jam || null
    const m = jam.match(TIME)
    if (m) {
      const t = `${m[1].padStart(2, '0')}.${m[2]}-${m[3].padStart(2, '0')}.${m[4]}`
      opening_hours = Object.fromEntries(DAYS.map((d) => [d, t]))
      open_hours = `${t} setiap hari`
    }

    const photos = g('foto').split('|').map((s) => s.trim()).filter(Boolean)
    if (photos.length > 5 || photos.some((p) => !p.startsWith('https://'))) return err('Foto: maks 5 URL https, dipisah |')

    seen.add(key)
    return {
      line, name, status: 'ok',
      row: {
        name, category, city, address: g('alamat') || null, lat, lng, budget_min: bmin, budget_max: bmax,
        description: g('deskripsi') || null, photos, maps_url: g('maps_url') || null,
        opening_hours, open_hours, status: 'verified',
      },
    }
  })
}

export default function CsvImport() {
  const supabase = createClient()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)

  function template() {
    const csv =
      HEADERS.join(',') + '\n' +
      '"CONTOH - HAPUS BARIS INI",alam,Karo,"Jl. Contoh No. 1",2.9167,98.5167,10000,50000,08.00-18.00,"Deskripsi singkat","https://contoh.com/1.jpg|https://contoh.com/2.jpg",\n'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'template-destinasi.csv'
    a.click()
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { data } = await supabase.from('destinations').select('name,city')
      const existing = new Set((data ?? []).map((d) => `${d.name.toLowerCase()}|${(d.city ?? '').toLowerCase()}`))
      setItems(build(await file.text(), existing))
    } catch (err: any) {
      setItems([])
      toast.error(err.message ?? 'File tidak bisa dibaca.')
    }
  }

  const ok = items.filter((i) => i.status === 'ok')

  async function run() {
    setBusy(true)
    const { error } = await supabase.from('destinations').insert(ok.map((i) => i.row!))
    setBusy(false)
    if (error) return toast.error('Gagal mengimpor: ' + error.message)
    await logAdmin(supabase, 'dest_import', 'destination', 'csv', `${ok.length} destinasi`)
    toast.success(`${ok.length} destinasi diimpor.`)
    router.push('/admin/destinasi')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 text-sm">
          <p>Kolom: <code>{HEADERS.join(', ')}</code>. Wajib: nama, kategori, kota. Foto berupa URL https dipisah tanda <code>|</code>.
            Jam buka format <code>08.00-17.00</code> (berlaku tiap hari). Kategori: {CATEGORIES.join(', ')}. Pemisah koma atau titik koma sama-sama dikenali.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={template}><Download className="mr-1 h-4 w-4" />Unduh template</Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Upload className="h-4 w-4" />Pilih file CSV
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
            </label>
          </div>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <b>{ok.length}</b> siap diimpor · {items.filter((i) => i.status === 'error').length} error · {items.filter((i) => i.status === 'skip').length} dilewati
            </p>
            <div className="max-h-80 divide-y overflow-y-auto rounded-lg border text-sm">
              {items.map((i) => (
                <div key={i.line} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate">Baris {i.line}: {i.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {i.msg && <span className="text-xs text-muted-foreground">{i.msg}</span>}
                    <Badge variant={i.status === 'ok' ? 'default' : i.status === 'error' ? 'destructive' : 'secondary'}>
                      {i.status === 'ok' ? 'OK' : i.status === 'error' ? 'Error' : 'Lewati'}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
            <Button disabled={busy || ok.length === 0} onClick={run}>
              {busy ? 'Mengimpor…' : `Impor ${ok.length} destinasi valid`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}