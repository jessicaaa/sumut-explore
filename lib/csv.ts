export function parseCsv(text: string): string[][] {
  const t = text.replace(/^\uFEFF/, '')
  const first = t.split(/\r?\n/)[0] ?? ''
  const d = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let q = false
  const flush = () => {
    row.push(cell)
    cell = ''
    if (row.some((x) => x.trim() !== '')) rows.push(row)
    row = []
  }
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++ } else q = false }
      else cell += c
    } else if (c === '"') q = true
    else if (c === d) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; flush() }
    else cell += c
  }
  flush()
  return rows
}