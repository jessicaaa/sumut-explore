'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Compass, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'user' | 'owner'>('user')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email'))
    const password = String(fd.get('password'))
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) return toast.error('Email atau kata sandi salah.')
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/')
      router.refresh()
      return
    }

    if (!agree) {
      setLoading(false)
      return toast.error('Setujui syarat penggunaan dulu.')
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          full_name: fd.get('full_name'), role,
          whatsapp: fd.get('whatsapp'), instagram: fd.get('instagram'), terms: 'true',
        },
      },
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Akun dibuat. Cek emailmu untuk verifikasi, lalu masuk.')
    setMode('login')
  }

  const roleBtn = (v: 'user' | 'owner', Icon: typeof Compass, title: string, sub: string) => (
    <button type="button" onClick={() => setRole(v)}
      className={cn('flex-1 rounded-xl border p-3 text-left transition-colors',
        role === v ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent')}>
      <Icon className="mb-1 h-5 w-5 text-primary" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </button>
  )

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">{mode === 'login' ? 'Masuk' : 'Buat akun'}</CardTitle>
        <CardDescription>
          {mode === 'login' ? 'Selamat datang kembali.' : 'Gratis. Kontakmu aman sampai kamu menyetujui.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="flex gap-3">
                {roleBtn('user', Compass, 'Traveler', 'Cari teman jalan')}
                {roleBtn('owner', Store, 'Pemilik wisata', 'Daftarkan destinasi')}
              </div>
              <div className="space-y-1.5"><Label htmlFor="full_name">Nama lengkap</Label>
                <Input id="full_name" name="full_name" required /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="628xxxxxxxxxx" /></div>
                <div className="space-y-1.5"><Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" name="instagram" placeholder="tanpa @" /></div>
              </div>
            </>
          )}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata sandi</Label>
              {mode === 'login' && <Link href="/lupa-sandi" className="text-xs text-primary hover:underline">Lupa kata sandi?</Link>}
            </div>
            <Input id="password" name="password" type="password" minLength={6} required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {mode === 'register' && (
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
              <span>Saya setuju dengan <Link href="/privasi" target="_blank" className="text-primary underline">Syarat Penggunaan</Link>:
                kontak saya hanya dibagikan setelah saya menyetujui.</span>
            </label>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </Button>
          <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}