'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [msg, setMsg] = useState('')
  const [f, setF] = useState({
    email: '', password: '', full_name: '', role: 'user', whatsapp: '', instagram: '', agree: false,
  })
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
      if (error) return setMsg(error.message)
      router.push('/')
      router.refresh()
    } else {
      if (!f.agree) return setMsg('Setujui syarat dan ketentuan dulu.')
      const { error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: { data: { full_name: f.full_name, role: f.role, whatsapp: f.whatsapp, instagram: f.instagram } },
      })
      if (error) return setMsg(error.message)
      setMsg('Berhasil daftar. Cek email untuk konfirmasi, lalu masuk.')
      setMode('login')
    }
  }

  const input = 'w-full rounded-lg border px-3 py-2'
  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-3 rounded-2xl bg-white p-6 shadow">
      <h1 className="text-xl font-bold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h1>
      {mode === 'register' && (
        <>
          <input className={input} placeholder="Nama lengkap" required onChange={(e) => set('full_name', e.target.value)} />
          <select className={input} onChange={(e) => set('role', e.target.value)}>
            <option value="user">Traveler</option>
            <option value="owner">Pemilik wisata</option>
          </select>
          <input className={input} placeholder="WhatsApp (628xxx)" onChange={(e) => set('whatsapp', e.target.value)} />
          <input className={input} placeholder="Instagram (tanpa @)" onChange={(e) => set('instagram', e.target.value)} />
        </>
      )}
      <input className={input} type="email" placeholder="Email" required onChange={(e) => set('email', e.target.value)} />
      <input className={input} type="password" minLength={6} placeholder="Password" required onChange={(e) => set('password', e.target.value)} />
      {mode === 'register' && (
        <label className="flex gap-2 text-sm">
          <input type="checkbox" onChange={(e) => set('agree', e.target.checked)} />
          Saya setuju kontak saya hanya dibagikan setelah saya menyetujui permintaan gabung.
        </label>
      )}
      {msg && <p className="text-sm text-orange-600">{msg}</p>}
      <button className="w-full rounded-lg bg-teal-600 py-2 font-semibold text-white">
        {mode === 'login' ? 'Masuk' : 'Daftar'}
      </button>
      <button type="button" className="w-full text-sm text-teal-700"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </form>
  )
}