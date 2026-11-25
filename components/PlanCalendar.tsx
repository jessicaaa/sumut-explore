'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import idLocale from '@fullcalendar/core/locales/id'
import type { DatesSetArg } from '@fullcalendar/core'
import { createClient } from '@/lib/supabase/client'

const addDay = (d: string) => {
  const x = new Date(d + 'T00:00:00Z')
  x.setUTCDate(x.getUTCDate() + 1)
  return x.toISOString().slice(0, 10)
}

export default function PlanCalendar({ destId }: { destId?: number }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])

  const load = useCallback(async (arg: DatesSetArg) => {
    let q = supabase
      .from('plans_view')
      .select('id,title,start_date,end_date,effective_status')
      .lte('start_date', arg.endStr.slice(0, 10))
      .gte('end_date', arg.startStr.slice(0, 10))
    if (destId) q = q.eq('destination_id', destId)
    const { data } = await q
    setEvents((data ?? []).map((p) => ({
      id: String(p.id),
      title: p.title,
      start: p.start_date,
      end: addDay(p.end_date),
      color: p.effective_status === 'open' ? '#0d9488' : '#94a3b8',
    })))
  }, [supabase, destId])

  return (
    <div className="rounded-2xl border bg-card p-3 md:p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={idLocale}
        events={events}
        datesSet={load}
        height="auto"
        eventClick={(i) => { i.jsEvent.preventDefault(); router.push(`/rencana/${i.event.id}`) }}
      />
      <p className="mt-2 text-xs text-muted-foreground">Hijau = masih terbuka · Abu-abu = ditutup/selesai</p>
    </div>
  )
}