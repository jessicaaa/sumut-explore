import { DAYS } from '@/lib/config'

export type Day = (typeof DAYS)[number]
export type DayHours = { closed: boolean; open: string; close: string }
export type Hours = Record<Day, DayHours>

export const STATUS_UI: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; hint: string }> = {
  draft: { label: 'Draf', variant: 'outline', hint: 'Belum dikirim untuk verifikasi.' },
  pending: { label: 'Menunggu verifikasi', variant: 'secondary', hint: 'Admin sedang meninjau pengajuanmu.' },
  verified: { label: 'Terverifikasi', variant: 'default', hint: 'Destinasi tayang di halaman publik.' },
  revision: { label: 'Perlu revisi', variant: 'destructive', hint: 'Perbaiki sesuai catatan admin, lalu kirim ulang.' },
  rejected: { label: 'Ditolak', variant: 'destructive', hint: 'Pengajuan tidak dapat diterima.' },
}

export const defaultHours = (): Hours =>
  Object.fromEntries(DAYS.map((d) => [d, { closed: false, open: '08:00', close: '17:00' }])) as Hours

export function hoursFromJson(j: Record<string, string> | null): Hours {
  const h = defaultHours()
  if (!j) return h
  for (const d of DAYS) {
    const m = j[d]?.match(/^(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})$/)
    if (m) h[d] = { closed: false, open: `${m[1]}:${m[2]}`, close: `${m[3]}:${m[4]}` }
    else h[d] = { ...h[d], closed: true }
  }
  return h
}

const str = (x: DayHours) => `${x.open.replace(':', '.')}-${x.close.replace(':', '.')}`

export const hoursToJson = (h: Hours) =>
  Object.fromEntries(DAYS.map((d) => [d, h[d].closed ? '' : str(h[d])]))

export function hoursSummary(h: Hours) {
  const vals = DAYS.map((d) => (h[d].closed ? '' : str(h[d])))
  return vals.every((v) => v && v === vals[0]) ? `${vals[0]} setiap hari` : 'Jam buka bervariasi'
}

export const hoursValid = (h: Hours) =>
  DAYS.some((d) => !h[d].closed) &&
  DAYS.every((d) => h[d].closed || (h[d].open && h[d].close && h[d].close > h[d].open))

export function parseCoords(s: string): { lat: number; lng: number } | null {
  const m = s.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  return m ? { lat: Number(m[1]), lng: Number(m[2]) } : null
}

// Kotak kasar Sumatera Utara
export const inSumut = (lat: number, lng: number) => lat >= 0 && lat <= 5.6 && lng >= 96.5 && lng <= 101