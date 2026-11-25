import { Umbrella } from 'lucide-react'
import { weatherInfo } from '@/lib/weather'
import { todayStr } from '@/lib/config'

const addDays = (d: string, n: number) => {
  const x = new Date(d + 'T00:00:00Z')
  x.setUTCDate(x.getUTCDate() + n)
  return x.toISOString().slice(0, 10)
}
const label = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{children}</p>
}

export default async function WeatherForecast({ lat, lng, from, to }: {
  lat: number; lng: number; from?: string; to?: string
}) {
  const today = todayStr()
  const maxDay = addDays(today, 15)
  let start = today
  let end = addDays(today, 4)

  if (from) {
    if (from > maxDay) return <Note>Prakiraan cuaca tersedia mulai 16 hari sebelum keberangkatan.</Note>
    start = from < today ? today : from
    end = to && to < maxDay ? to : maxDay
    if (end > addDays(start, 6)) end = addDays(start, 6)
    if (end < start) return <Note>Perjalanan ini sudah lewat.</Note>
  }

  let days: any[] = []
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FJakarta&start_date=${start}&end_date=${end}`
    const r = await fetch(url, { next: { revalidate: 3600 } })
    if (!r.ok) throw new Error('weather')
    const d = (await r.json()).daily
    days = d.time.map((t: string, i: number) => ({
      date: t,
      code: d.weather_code[i],
      max: Math.round(d.temperature_2m_max[i]),
      min: Math.round(d.temperature_2m_min[i]),
      rain: d.precipitation_probability_max[i] ?? 0,
    }))
  } catch {
    return <Note>Data cuaca sedang tidak tersedia. Coba lagi beberapa saat lagi.</Note>
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((d) => {
          const { Icon, label: cond } = weatherInfo(d.code)
          return (
            <div key={d.date} className="rounded-xl border bg-card p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">{label(d.date)}</p>
              <Icon className="mx-auto my-2 h-7 w-7 text-primary" />
              <p className="text-sm">{cond}</p>
              <p className="text-sm font-semibold">{d.max}° <span className="font-normal text-muted-foreground">/ {d.min}°</span></p>
              <p className="text-xs text-muted-foreground">Hujan {d.rain}%</p>
              {d.rain >= 60 && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-cta/15 px-2 py-0.5 text-xs font-medium text-cta">
                  <Umbrella className="h-3 w-3" />Bawa jas hujan
                </p>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Data cuaca oleh <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Open-Meteo.com</a>
      </p>
    </div>
  )
}