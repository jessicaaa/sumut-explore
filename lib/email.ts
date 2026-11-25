import { Resend } from 'resend'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type Mail = {
  to: string
  subject: string
  heading: string
  lines: string[]
  button?: { label: string; url: string }
  reason: string
}

function render(m: Mail) {
  const paras = m.lines.map((l) => `<p style="margin:0 0 12px;line-height:1.6">${esc(l)}</p>`).join('')
  const btn = m.button
    ? `<p style="margin:20px 0"><a href="${esc(m.button.url)}" style="background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">${esc(m.button.label)}</a></p>
       <p style="margin:0 0 12px;font-size:12px;color:#64748b">Jika tombol tidak berfungsi, salin tautan ini: ${esc(m.button.url)}</p>`
    : ''
  const html = `<!doctype html><html lang="id"><body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
    <p style="margin:0 0 16px;font-weight:700;color:#0f766e;font-size:18px">SumUt Explore</p>
    <h1 style="margin:0 0 16px;font-size:20px">${esc(m.heading)}</h1>
    ${paras}${btn}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 12px">
    <p style="margin:0;font-size:12px;color:#64748b">${esc(m.reason)}</p>
  </div></body></html>`
  const text = [m.heading, '', ...m.lines, m.button ? `\n${m.button.label}: ${m.button.url}` : '', '', m.reason].join('\n')
  return { html, text }
}

export async function sendMail(m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  if (!key || !from) {
    console.warn('[mail] RESEND_API_KEY / MAIL_FROM belum diisi, email dilewati')
    return false
  }
  const { html, text } = render(m)
  const { error } = await new Resend(key).emails.send({
    from,
    to: m.to,
    subject: m.subject.replace(/[\r\n]+/g, ' ').slice(0, 150),
    html,
    text,
    ...(process.env.MAIL_REPLY_TO ? { replyTo: process.env.MAIL_REPLY_TO } : {}),
  })
  if (error) {
    console.error('[mail]', error)
    return false
  }
  return true
}