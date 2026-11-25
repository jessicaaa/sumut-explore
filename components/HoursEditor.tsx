'use client'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { DAYS } from '@/lib/config'
import type { Day, Hours } from '@/lib/dest'

export default function HoursEditor({ value, onChange }: { value: Hours; onChange: (h: Hours) => void }) {
  const set = (d: Day, patch: Partial<Hours[Day]>) => onChange({ ...value, [d]: { ...value[d], ...patch } })
  const copyAll = () =>
    onChange(Object.fromEntries(DAYS.map((d) => [d, { ...value.senin }])) as Hours)

  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={copyAll}>
        <Copy className="mr-1 h-4 w-4" />Salin jam Senin ke semua hari
      </Button>
      <div className="divide-y rounded-xl border">
        {DAYS.map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-3 px-3 py-2">
            <span className="w-20 text-sm font-medium capitalize">{d}</span>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={value[d].closed} onCheckedChange={(v) => set(d, { closed: v === true })} />Tutup
            </label>
            <Input type="time" className="w-32" disabled={value[d].closed} value={value[d].open}
              onChange={(e) => set(d, { open: e.target.value })} aria-label={`Buka ${d}`} />
            <span className="text-muted-foreground">–</span>
            <Input type="time" className="w-32" disabled={value[d].closed} value={value[d].close}
              onChange={(e) => set(d, { close: e.target.value })} aria-label={`Tutup ${d}`} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Untuk buka 24 jam, isi 00:00 sampai 23:59.</p>
    </div>
  )
}