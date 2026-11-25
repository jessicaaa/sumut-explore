export const rupiah = (n: number | null) => (n == null ? '-' : 'Rp' + n.toLocaleString('id-ID'))

export const tanggal = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export const rentang = (a: string, b: string) => (a === b ? tanggal(a) : `${tanggal(a)} – ${tanggal(b)}`)

export const budget = (min: number | null, max: number | null) =>
  min == null && max == null ? 'Belum ada info' : `${rupiah(min)} – ${rupiah(max)}`