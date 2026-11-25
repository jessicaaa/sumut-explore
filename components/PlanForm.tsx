'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { field } from '@/lib/ui'
import { JOIN_DEADLINE_DAYS, todayStr } from '@/lib/config'
import { rentang, rupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

type Initial = {
  id?: number; title?: string | null; description?: string | null; destination_id?: number | null
  start_date?: string | null; end_date?: string | null; max_buddies?: number
  budget_per_person?: number | null; status?: string
}
const steps = ['Destinasi & tanggal', 'Detail', 'Tinjau']

export default function PlanForm({ dests, initial }: { dests: { id: number; name: string }[]; initial?: Initial }) {
  const supabase = createClient()
  const router = useRouter()
  const editing = !!initial?.id
  const wasDraft = !editing || initial?.status === 'draft'
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    destination_id: initial?.destination_id ? String(initial.destination_id) : '',
    start_date: initial?.start_date ?? '',
    end_date: initial?.end_date ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    max_buddies: initial?.max_buddies ?? 3,
    budget_per_person: initial?.budget_per_person ? String(initial.budget_per_person) : '',
  })
  const set = (k: keyof typeof f, v: string | number) => setF((s) => ({ ...s, [k]: v }))
  const destName = dests.find((d) => String(d.id) === f.destination_id)?.name

  function validate(upTo: number): string | null {
    if (upTo >= 0) {
      if (!f.destination_id) return 'Pilih destinasi.'
      if (!f.start_date || !f.end_date) return 'Isi tanggal berangkat dan pulang.'
      if (f.end_date < f.start_date) return 'Tanggal pulang tidak boleh sebelum berangkat.'
      if (wasDraft && f.start_date < todayStr()) return 'Tanggal berangkat tidak boleh di masa lalu.'
    }
    if (upTo >= 1) {
      if (f.title.trim().length < 5) return 'Judul minimal 5 karakter.'
      if (Number(f.max_buddies) < 1 || Number(f.max_buddies) > 10) return 'Kuota teman 1–10.'
    }
    return null
  }

  function next() {
    const e = validate(step)
    if (e) return toast.error(e)
    setStep(step + 1)
  }

  async function save(mode: 'draft' | 'publish') {
    if (mode === 'publish') {
      const e = validate(1)
      if (e) return toast.error(e)
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const status = mode === 'draft' ? 'draft' : wasDraft ? 'open' : initial!.status!
    const payload = {
      destination_id: f.destination_id ? Number(f.destination_id) : null,
      title: f.title.trim() || null,
      description: f.description.trim() || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
      max_buddies: Number(f.max_buddies),
      budget_per_person: f.budget_per_person ? Number(f.budget_per_person) : null,
      status,
    }
    setBusy(true)
    const res = editing
      ? await supabase.from('plans').update(payload).eq('id', initial!.id!).select('id').single()
      : await supabase.from('plans').insert({ ...payload, creator_id: user.id }).select('id').single()
    setBusy(false)

    if (res.error) {
      return toast.error(
        res.error.message.includes('QUOTA_BELOW_APPROVED')
          ? 'Kuota tidak boleh kurang dari jumlah peserta yang sudah disetujui.'
          : 'Gagal menyimpan: ' + res.error.message
      )
    }
    toast.success(mode === 'draft' ? 'Draf disimpan.' : editing ? 'Perubahan disimpan.' : 'Rencana dipublikasikan.')
    router.push(mode === 'draft' ? '/dashboard' : `/rencana/${res.data.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold',
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'border-2 border-primary text-primary' : 'border text-muted-foreground')}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('hidden text-sm sm:block', i === step ? 'font-medium' : 'text-muted-foreground')}>{s}</span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="dest">Destinasi</Label>
                <select id="dest" className={field} value={f.destination_id} onChange={(e) => set('destination_id', e.target.value)}>
                  <option value="">Pilih destinasi</option>
                  {dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="start">Berangkat</Label>
                  <Input id="start" type="date" min={wasDraft ? todayStr() : undefined} value={f.start_date}
                    onChange={(e) => set('start_date', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end">Pulang</Label>
                  <Input id="end" type="date" min={f.start_date || undefined} value={f.end_date}
                    onChange={(e) => set('end_date', e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Teman baru bisa mengajukan gabung sampai H-{JOIN_DEADLINE_DAYS} sebelum berangkat.</p>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul rencana</Label>
                <Input id="title" maxLength={80} value={f.title} placeholder="Contoh: Healing 2 hari di Danau Toba"
                  onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea id="desc" rows={4} maxLength={600} value={f.description}
                  placeholder="Gaya perjalanan, rencana kegiatan, transportasi, titik kumpul…"
                  onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="quota">Kuota teman (di luar kamu)</Label>
                  <Input id="quota" type="number" min={1} max={10} value={f.max_buddies}
                    onChange={(e) => set('max_buddies', Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="budget">Perkiraan budget / orang (Rp)</Label>
                  <Input id="budget" type="number" min={0} step={10000} value={f.budget_per_person}
                    onChange={(e) => set('budget_per_person', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <dl className="space-y-3 text-sm">
              {[
                ['Destinasi', destName ?? '-'],
                ['Tanggal', f.start_date && f.end_date ? rentang(f.start_date, f.end_date) : '-'],
                ['Judul', f.title || '-'],
                ['Kuota', `${f.max_buddies} teman`],
                ['Budget / orang', f.budget_per_person ? rupiah(Number(f.budget_per_person)) : 'Belum ditentukan'],
                ['Deskripsi', f.description || '-'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2 border-b pb-2 last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="col-span-2 whitespace-pre-line">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>Kembali</Button>
        <div className="flex gap-2">
          {wasDraft && <Button variant="ghost" disabled={busy} onClick={() => save('draft')}>Simpan Draf</Button>}
          {step < 2
            ? <Button onClick={next}>Lanjut</Button>
            : <Button disabled={busy} onClick={() => save('publish')} className="bg-cta text-cta-foreground hover:bg-cta/90">
                {busy ? 'Menyimpan…' : wasDraft ? 'Publikasikan' : 'Simpan perubahan'}
              </Button>}
        </div>
      </div>
    </div>
  )
}